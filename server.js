// Aller chercher les configurations de l'application
import 'dotenv/config';

// Importer les fichiers et librairies
import express, { json, request, urlencoded } from 'express';
import expressHandlebars from 'express-handlebars';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cspOption from './csp-options.js'
import { getProduit } from './model/produit.js';
import { getPanier, addToPanier, removeFromPanier, emptyPanier } from './model/panier.js';
import { getCommande, addCommande, modifyEtatCommande, getEtatCommande } from './model/commande.js';
import { validateEmail, validateId, validatePanier, validatePassword } from './validation.js';
import memorystore from 'memorystore';
import passport from 'passport';
import session from 'express-session';
import { addUtilisateur } from './model/utilisateur.js';
import './authentification.js';
import https from 'https';
import { readFile } from 'fs/promises';
import redirectToHttps from './redirect-to-https.js';

// Création du serveur
const app = express();
const MemoryStore = memorystore(session);
// ...

// Ajout de middlewares
app.use(session({
    cookie: { maxAge: 3600000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 3600000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));
app.engine('handlebars', expressHandlebars({
    helpers: {
        equals: (valeur1, valeur2) => valeur1 === valeur2
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'handlebars');

// Ajout de middlewares
app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(redirectToHttps);
app.enable('trust proxy');
// Routes
// Route de la page du menu
app.get('/', async (request, response) => {
    response.render('menu', {
        title: 'Menu',
        produit: await getProduit(),
        user: request.user
    });
});

// Route de la page du panier
app.get('/panier', async (request, response) => {
    let panier = await getPanier()
    response.render('panier', {
        title: 'Panier',
        produit: panier,
        estVide: panier.length <= 0
    });
});

// Route pour ajouter un élément au panier
app.post('/panier', async (request, response) => {
    if (!request.user) {
        response.sendStatus(401);
    }
    else {
        if (validateId(request.body.idProduit)) {
            addToPanier(request.body.idProduit, 1);
            response.sendStatus(201);
        } else {
            response.sendStatus(400);
        }
    }

});

// Route pour supprimer un élément du panier
app.patch('/panier', async (request, response) => {
    if (!request.user) {
        response.sendStatus(401);
    }
    else {
        if (validateId(request.body.idProduit)) {
            removeFromPanier(request.body.idProduit);
            response.sendStatus(200);
        } else {
            response.sendStatus(400);
        }
    }
});

// Route pour vider le panier
app.delete('/panier', async (request, response) => {
    if (!request.user) {
        response.sendStatus(401);
    }
    else {
        if (await validatePanier()) {
            emptyPanier();
            response.sendStatus(200);
        } else {
            response.sendStatus(400);
        }
    }
});

// Route de la page des commandes
app.get('/commande', async (request, response) => {
    if (!request.user) {
        response.sendStatus(401);
    }
    else {
        if (!request?.user?.id_type_utilisateur === 2) {
            response.render('commande', {
                title: 'Commandes',
                commande: await getCommande(),
                etatCommande: await getEtatCommande()
            });
        }
        else {
            response.sendStatus(401);
        }
    }
});

// Route pour soumettre le panier
app.post('/commande', async (request, response) => {
    if (!request.user) {
        response.sendStatus(401);
    }
    else {
        if (!request?.user?.id_type_utilisateur === 2) {
            if (await validatePanier()) {
                addCommande();
                response.sendStatus(201);
            } else {
                response.sendStatus(400);
            }
        }
        else {
            response.sendStatus(401);
        }
    }

});

// Route pour modifier l'état d'une commande
app.patch('/commande', async (request, response) => {
    if (!request.user) {
        response.sendStatus(401);
    } else {
        if (!request?.user?.id_type_utilisateur === 2) {
            if (await validateId(request.body.idCommande) &&
                await validateId(request.body.idEtatCommande)) {
                modifyEtatCommande(
                    request.body.idCommande,
                    request.body.idEtatCommande
                );
                response.sendStatus(200);
            } else {
                response.sendStatus(400);
            }
        }
        else{
            response.sendStatus(401);
        }
    }

});

app.get('/signup', (request, response, next) => {
    response.render('signup');
});

app.post('/signup', async (request, response, next) => {
    if (validateEmail(request.body.email) &&
        validatePassword(request.body.password)) {
        try {
            await addUtilisateur(request.body.email, request.body.password, 1);
            response.sendStatus(201);
        }
        catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                response.sendStatus(409);
            }
            else {
                next(error);
            }
        }
    }
    else {
        response.sendStatus(400);
        console.log("hena");
    }
});

app.get('/login', (request, response, next) => {
    response.render('login', {});
});

app.post('/login', (request, response, next) => {
    if (validateEmail(request.body.email) &&
        validatePassword(request.body.password)) {
        passport.authenticate('local', (error, user, info) => {
            if (error) {
                console.log(error);
                next(error);
            }
            else if (!user) {
                console.log("non succes");
                response.status(401).json(info);
            }
            else {
                request.logIn(user, (error) => {
                    if (error) {
                        console.log("non succes");
                        next(error);
                    }
                    console.log("succes dans login");
                    response.sendStatus(200);
                });
            }
        })(request, response, next);
    }
    else {
        response.sendStatus(400);
    }
});

app.post('/logout', (request, response) => {
    request.logout();
    response.redirect('/');
});

// Renvoyer une erreur 404 pour les routes non définies
app.use(function (request, response) {
    // Renvoyer simplement une chaîne de caractère indiquant que la page n'existe pas
    response.status(404).send(request.originalUrl + ' not found.');
});

// Démarrage du serveur
//app.listen(process.env.PORT);
console.info(`Serveurs démarré:`);
console.info(`http://localhost:${process.env.PORT}`);

console.info('Serveurs démarré:');
if (process.env.NODE_ENV === 'production') {
    app.listen(process.env.PORT);
    console.info(`http://localhost:undefined`);
}
else {
    const credentials = {
        key: await readFile('./security/localhost.key'),
        cert: await readFile('./security/localhost.cert')
    }

    https.createServer(credentials, app).listen(process.env.PORT);
    console.info(`https://localhost:undefined`);
}