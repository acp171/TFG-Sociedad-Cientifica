const nodemailer = require('nodemailer');
const pool = require('../database');
const { obtenerSocio, obtenerSocios } = require('./socioUtils');

// Configuración
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 20000
});

async function crearNotificacion(socioId, titulo, mensaje) {
    const values = [
        socioId,
        titulo,
        mensaje
    ];
    const query = `INSERT INTO Notificaciones(socio, titulo, mensaje)
                   VALUES ($1, $2, $3);`;
    await pool.query(query, values);

    // Obtiene el correo del socio
    const socio = await obtenerSocio(socioId);
    const email = socio?.email;

    if (email) {
        await enviarEmail(email, titulo, mensaje);
    }
}

async function crearNotificacionSocio(titulo, mensaje) {
    const values = [
        1,
        titulo,
        mensaje
    ];
    const query = `INSERT INTO Notificaciones(socio, titulo, mensaje)
                   VALUES ($1, $2, $3);`;
    await pool.query(query, values);

    await enviarEmail("admin@admin.com", titulo, mensaje);
}

async function crearNotificacionEvento(titulo, mensaje) {
    // Obtener todos los socios
    const socios = await obtenerSocios();

    // Enviar notificación a cada socio
    for (const socio of socios) {
        if (socio.socio_rol !== 'Administrador') {
            const values = [
                socio.id_socio,
                titulo,
                mensaje
            ];
            const query = `INSERT INTO Notificaciones(socio, titulo, mensaje)
                        VALUES ($1, $2, $3);`;
            await pool.query(query, values);

            await enviarEmail(socio.email, titulo, mensaje);
        }
    }
}

async function enviarEmail(destinatario, asunto, mensaje) {
    try {
        await transporter.sendMail({
            from: `"Sociedad Científica" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: asunto,
            html: `<p>${mensaje}</p>`
        });
    } catch (error) {
        console.error('Error al enviar email:', error.message);
    }
}

module.exports = {
    crearNotificacion,
    crearNotificacionSocio,
    crearNotificacionEvento,
};