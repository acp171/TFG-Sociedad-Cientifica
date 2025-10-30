const sgMail = require('@sendgrid/mail')
const pool = require('../database');
const { obtenerSocio, obtenerSocios } = require('./socioUtils');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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
    const msg = {
        to: destinatario,
        from: `"Sociedad Científica" <${process.env.EMAIL_USER}>`,
        subject: asunto,
        html: `<p>${mensaje}</p>`
    }
    
    sgMail
    .send(msg)
    .then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.error(error)
    })
}

module.exports = {
    crearNotificacion,
    crearNotificacionSocio,
    crearNotificacionEvento,
};