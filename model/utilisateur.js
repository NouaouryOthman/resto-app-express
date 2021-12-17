import connectionPromise from "../connection.js";
import bcrypt  from 'bcrypt';

export const addUtilisateur = async (email, password, idTypeUser) => {
    let connection = await connectionPromise;
    let encryptedPassword = await bcrypt.hash(password, 10);
    await connection.run(
        `INSERT INTO utilisateur(email, password, id_type_utilisateur)
        VALUES (?, ?, ?)`,
        [email, encryptedPassword, idTypeUser]
    )
}

export const getUtilisateur = async (email) => {
    let connection = await connectionPromise;

    const result = await connection.get(
        `SELECT id_utilisateur, email, password, id_type_utilisateur 
        FROM utilisateur
        WHERE email = ?`,
        [email]
    );

    return result;
}