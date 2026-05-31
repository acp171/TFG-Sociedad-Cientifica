const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// La clave maestra viene del .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'clave-secreta-de-por-lo-menos-32-chars-para-el-tfg';

/**
 * Cifra un texto usando AES-256-GCM (Grado militar/bancario)
 * @param {string} text 
 */
function encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, ITERATIONS, KEY_LENGTH, 'sha512');

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Devolvemos todo en un solo string para guardarlo en la DB
    return JSON.stringify({
        i: iv.toString('hex'),
        s: salt.toString('hex'),
        t: tag.toString('hex'),
        c: encrypted.toString('hex')
    });
}

/**
 * Descifra el string guardado en la DB
 * @param {string} encryptedJson 
 */
function decrypt(encryptedJson) {
    if (!encryptedJson) return null;
    try {
        const { i, s, t, c } = JSON.parse(encryptedJson);
        const iv = Buffer.from(i, 'hex');
        const salt = Buffer.from(s, 'hex');
        const tag = Buffer.from(t, 'hex');
        const encrypted = Buffer.from(c, 'hex');

        const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, ITERATIONS, KEY_LENGTH, 'sha512');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (error) {
        console.error("Error al descifrar dato:", error.message);
        return null;
    }
}

module.exports = { encrypt, decrypt };
