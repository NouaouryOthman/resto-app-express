import { getPanier } from "./model/panier.js";

/**
 * Valide un identifiant (ID) reçu par le serveur.
 * @param {*} id L'identifiant à valider.
 * @returns Une valeur booléenne indiquant si l'identifiant est valide ou non.
 */
export const validateId = (id) => {
    return !!id &&
        typeof id === 'number' &&
        Number.isInteger(id) &&
        id > 0;
}

export const validateEmail = (email)=>{
    return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

export const validatePassword = (password) =>{
    return password.length >= 8;
}

/**
 * Valide le panier dans la base de données du serveur.
 * @returns Une valeur booléenne indiquant si le panier est valide ou non.
 */
export const validatePanier = async () => {
    let panier = await getPanier();
    return panier.length > 0;
}