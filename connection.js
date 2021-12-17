import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';

/**
 * Ouvre la base de données SQLite. Si le fichier de base de données n'existe 
 * pas, il sera automatiquement créé.
 * @returns Une promesse de connexion à la base de données.
 */
const createOrOpenDatabase = () => {
    return open({
        filename: process.env.DB_FILE,
        driver: sqlite3.Database
    });
}

// On regarde si le fichier de base de données existe
const connectionPromise = fs.access(process.env.DB_FILE)
.then(() => {
    // Si le fichier de base de données existe, on ouvre simplement la base 
    // de données.
    return createOrOpenDatabase();
})
.catch(() => {
    // Si le fichier de base de données n'existe pas, on crée la base de 
    // données après avoir créé et ouvert la base de données
    return createOrOpenDatabase().then((connection) => {
        connection.exec(
            `CREATE TABLE type_utilisateur(
                id_type_utilisateur INTEGER PRIMARY KEY,
                nom TEXT NOT NULL
            );
            CREATE TABLE etat_commande(
                id_etat_commande INTEGER PRIMARY KEY,
                nom TEXT NOT NULL
            );
            CREATE TABLE produit(
                id_produit INTEGER PRIMARY KEY,
                nom TEXT,
                chemin_image TEXT,
                prix REAL
            );
            CREATE TABLE utilisateur(
                id_utilisateur INTEGER PRIMARY KEY,
                id_type_utilisateur INTEGER,
                email TEXT,
                password TEXT,
                FOREIGN KEY(id_type_utilisateur)
                REFERENCES type_utilisateur(id_type_utilisateur)
            );
            CREATE TABLE commande(
                id_commande INTEGER PRIMARY KEY,
                id_utilisateur INTEGER,
                id_etat_commande INTEGER,
                date INTEGER,
                FOREIGN KEY(id_utilisateur)
                REFERENCES utilisateur(id_utilisateur)
            );
            CREATE TABLE commande_produit(
                id_commande INTEGER,
                id_produit INTEGER,
                quantite INTEGER,
                PRIMARY KEY(id_commande, id_produit),
                FOREIGN KEY(id_commande)
                REFERENCES commande(id_commande),
                FOREIGN KEY(id_produit)
                REFERENCES produit(id_produit)
            );
            CREATE TABLE panier(
                id_utilisateur INTEGER,
                id_produit INTEGER,
                quantite INTEGER,
                PRIMARY KEY(id_utilisateur, id_produit),
                FOREIGN KEY(id_utilisateur)
                REFERENCES utilisateur(id_utilisateur),
                FOREIGN KEY(id_produit)
                REFERENCES produit(id_produit)
            );
            
            INSERT INTO type_utilisateur(nom) VALUES('client');
            INSERT INTO type_utilisateur(nom) VALUES('administrateur');
            
            INSERT INTO etat_commande(nom) VALUES('cuisine');
            INSERT INTO etat_commande(nom) VALUES('livraison');
            INSERT INTO etat_commande(nom) VALUES('terminée');
            
            INSERT INTO utilisateur(id_type_utilisateur, email, password)
            VALUES(1, 'jwilki@lacitec.on.ca', 'Test1234');
            
            INSERT INTO produit(nom, chemin_image, prix) VALUES
            ('Espresso', './img/espresso.png', 2.50),
            ('Latté', './img/latte.png', 3.85),
            ('Cappuccino', './img/cappuccino.png', 3.85),
            ('Americano', './img/americano.png', 2.80),
            ('Décaféiné', './img/decaf.png', 3.80),
            ('Thé Earl Grey', './img/earlgray.png', 2.35),
            ('Thé Chai', './img/chai.png', 2.35),
            ('Thé vert', './img/vert.png', 2.35),
            ('Thé à la menthe', './img/menthe.png', 2.35),
            ('Thé London Fog', './img/londonfog.png', 4.30),
            ('Thé matcha', './img/matcha.png', 4.30),
            ('Latté sur glace', './img/latteglace.png', 3.95),
            ('Frappé Moka', './img/frappemoka.png', 4.00),
            ('Chocolat chaud', './img/chocolat.png', 4.00),
            ('Chocolat blanc chaud', './img/chocolatblanc.png', 2.85);`
        );
    
        return connection;
    })
})

export default connectionPromise;