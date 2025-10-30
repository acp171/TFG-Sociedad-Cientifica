const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../database');
const nodemailer = require('nodemailer');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const RATE_LIMITER = new RateLimiterMemory({
    points: 5,
    duration: 60 * 60, // 5 intentos por hora
});

// transport nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// UTIL: hash token con SHA256
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const ip = req.ip;

    try {
        await RATE_LIMITER.consume(ip);

        // Busca usuario por email
        const userRes = await pool.query('SELECT id_socio, email FROM Socio WHERE email = $1', [email]);
        
        if (userRes.rowCount === 0) {
            // Responder con éxito aunque no exista para no filtrar emails
            return res.status(200).json({ message: 'Si existe una cuenta con ese correo, recibirás instrucciones.' });
        }

        const user = userRes.rows[0];
        // Generar token seguro
        const token = crypto.randomBytes(32).toString('hex'); // 64 chars
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora expiración

        // Guardar token hashed
        await pool.query(
            `INSERT INTO PasswordResetTokens (usuario, token_hash, expires_at, usado)
            VALUES ($1, $2, $3, FALSE)`,
            [user.id_socio, tokenHash, expiresAt]
        );

        // Construir URL
        const resetUrl = `https://scdi.vercel.app/reset-password?token=${token}`;

        // Enviar email
        const html = `
            <p>Hola,</p>
            <p>Solicitaste restablecer tu contraseña. Haz clic en el enlace para continuar:</p>
            <p><a href="${resetUrl}">Restablecer contraseña</a></p>
            <p>Si no pediste esto, ignora este correo. El enlace expirará en 1 hora.</p>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Restablecer contraseña',
            html,
        });

        return res.status(200).json({ message: 'Si existe una cuenta con ese correo, recibirás instrucciones.' });
    }
    catch (err) {
        if (err instanceof Error && err.msBeforeNext) {
            // rate limiter error
            return res.status(429).json({ message: 'Demasiadas solicitudes. Intente más tarde.' });
        }

        console.error(err);
        return res.status(500).json({ message: 'Error interno' });
    }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Faltan datos' });

    try {
        const tokenHash = hashToken(token);

        // Busca token válido y no usado y no expirado
        const q = `SELECT id, usuario, expires_at, usado FROM PasswordResetTokens
                WHERE token_hash = $1`;
        const r = await pool.query(q, [tokenHash]);

        if (r.rowCount === 0) return res.status(400).json({ message: 'Token inválido o expirado' });

        const tokenRow = r.rows[0];
        if (tokenRow.usado) return res.status(400).json({ message: 'Token ya usado' });
        if (new Date(tokenRow.expires_at) < new Date()) return res.status(400).json({ message: 'Token expirado' });

        // Validaciones de contraseña
        if (password.length < 8) return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });

        // Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(password, salt);

        // Actualizar contraseña del usuario
        await pool.query('UPDATE Socio SET password = $1 WHERE id_socio = $2', [passHash, tokenRow.usuario]);

        // Marcar token como usado
        await pool.query('UPDATE PasswordResetTokens SET usado = TRUE WHERE id = $1', [tokenRow.id]);

        return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno' });
    }
});

module.exports = router;