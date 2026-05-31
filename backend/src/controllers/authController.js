const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database');
const stripe = require('../config/stripe');
const { encrypt } = require('../utils/cryptoUtils');
const saltRounds = 10;
const SECRET_KEY = process.env.JWT_SECRET;

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    try {
        const query = `
            SELECT s.*, t.nombre_tipo AS plan_nombre, t.cuota
            FROM Socio s
            JOIN Tipo_Socio t ON s.tipo_socio = t.id_tipo_socio
            WHERE s.email = $1;
        `;
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const socio = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, socio.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            {
                id: socio.id_socio,
                email: socio.email,
                nombre: socio.nombre,
                rol: socio.socio_rol,
                tipo: socio.tipo_socio,
                fecha_expiracion: socio.fecha_expiracion
            },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login exitoso.',
            socio: {
                id: socio.id_socio,
                nombre: socio.nombre,
                email: socio.email,
                rol: socio.socio_rol,
                tipo: socio.tipo_socio,
                plan_nombre: socio.plan_nombre,
                cuota: socio.cuota,
                fecha_expiracion: socio.fecha_expiracion
            },
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const register = async (req, res) => {
    const { plan, formData } = req.body;

    if (!plan || !formData) {
        return res.status(400).json({ message: 'Faltan datos del plan o formulario.' });
    }

    const isValidEmail = /\S+@\S+\.\S+/.test(formData.email);
    if (!isValidEmail) {
        return res.status(400).json({ message: 'Correo electrónico no válido.' });
    }

    const hashedPassword = await bcrypt.hash(formData.password, saltRounds);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: plan.cuota * 100,
            currency: 'eur',
            payment_method_types: ['card', 'sepa_debit', 'paypal'],
            metadata: {
                tipo_pago: 'registro_socio',
                id_plan: plan.id_tipo_socio.toString(),
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                email: formData.email,
                password: hashedPassword,
                telefono: formData.telefono,
                fecha_nacimiento: formData.fecha_nacimiento,
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creando PaymentIntent:', error);
        res.status(500).json({ message: 'Error creando sesión de pago.' });
    }
};

const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userRes = await pool.query('SELECT id_socio, email FROM Socio WHERE email = $1', [email]);
        if (userRes.rowCount === 0) return res.status(200).json({ message: 'Si existe una cuenta con ese correo, recibirás instrucciones.' });

        const user = userRes.rows[0];
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

        await pool.query('INSERT INTO PasswordResetTokens (socio, token_hash, expires_at, usado) VALUES ($1, $2, $3, FALSE)', [user.id_socio, tokenHash, expiresAt]);

        const resetUrl = `https://scdi.vercel.app/restablecer-contrasena?token=${token}`;
        const msg = {
            to: user.email,
            from: `"Sociedad Científica" <${process.env.EMAIL_USER}>`,
            subject: 'Restablecer contraseña',
            html: `<p>Hola,</p><p>Solicitaste restablecer tu contraseña. Haz clic aquí: <a href="${resetUrl}">Restablecer</a></p>`
        };
        await sgMail.send(msg);
        return res.status(200).json({ message: 'Si existe una cuenta con ese correo, recibirás instrucciones.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error interno' });
    }
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Faltan datos' });

    try {
        const tokenHash = hashToken(token);
        const r = await pool.query('SELECT * FROM PasswordResetTokens WHERE token_hash = $1', [tokenHash]);

        if (r.rowCount === 0) return res.status(400).json({ message: 'Token inválido' });
        const tokenRow = r.rows[0];
        if (tokenRow.usado || new Date(tokenRow.expires_at) < new Date()) return res.status(400).json({ message: 'Token inválido o expirado' });

        if (password.length < 8) return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });

        const passHash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE Socio SET password = $1 WHERE id_socio = $2', [passHash, tokenRow.socio]);
        await pool.query('UPDATE PasswordResetTokens SET usado = TRUE WHERE id = $1', [tokenRow.id]);

        return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno' });
    }
};

module.exports = {
    login,
    register,
    forgotPassword,
    resetPassword
};
