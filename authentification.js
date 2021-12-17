import bcrypt from 'bcrypt';
import passport from "passport";
import { Strategy } from "passport-local";
import { getUtilisateur } from "./model/utilisateur.js";

const config = {
    usernameField: 'email',
    passwordField: 'password'
};

passport.use(new Strategy(config, async (email, password, done) => {
    try {
        const utilisateur = await getUtilisateur(email);
        if (!utilisateur) {
            return done(null, false, { error: 'mauvais utilisateur' });
        }
        const valide = await bcrypt.compare(password, utilisateur.password);
        if (!valide) {
            return done(null, false, { error: 'mauvais mot de passe' });
        }
        return done(null, utilisateur);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((utilisateur, done) => {
    done(null, utilisateur.email);
});

passport.deserializeUser(async (email, done) => {
    try {
        const user = await getUtilisateur(email);
        done(null, user);
    }
    catch (error) {
        done(error);
    }
});