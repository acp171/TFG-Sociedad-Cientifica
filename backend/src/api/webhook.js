const express = require("express");
const router = express.Router();
const pool = require('../database');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const { crearNotificacion } = require('../utils/notificaciones')
const { obtenerEvento } = require('../utils/eventoUtils');
const { obtenerSocio } = require("../utils/socioUtils");

// Comprobar pago
router.post('/', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    }
    catch (err) {
        console.log('⚠️  Webhook error:', err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const id_evento = session.metadata.id_evento;
        const socio_id = session.metadata.socio_id;

        const tipoPago = session.metadata.tipo_pago;
        if (tipoPago === 'registro_socio') {
            const { nombre, apellidos, email, password, telefono, fecha_nacimiento, id_plan } = session.metadata;
            
            const query = `INSERT INTO Socio(nombre, apellidos, email, password, telefono, 
                            fecha_nacimiento, fecha_alta, socio_rol, tipo_socio)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_socio, nombre, email;`;
        
            const values = [
                nombre,
                apellidos,
                email,
                password,
                telefono,
                fecha_nacimiento,
                new Date(),
                8,
                id_plan,
            ];
        
            try {
                const result = await pool.query(query, values);
                console.log("Socio insertado con ID: ", result.rows[0].id_socio);
        
                await crearNotificacion(
                    result.rows[0].id_socio,
                    'Bienvenido a la Sociedad Científica',
                    'Gracias por registrarte. Esperamos que disfrutes tu experiencia.'
                );
            } catch (error) {
                console.error("Error insertando socio: ", error.message);
            }        
        }
        else if (tipoPago === 'inscripcion_evento') {
            await pool.query("UPDATE Inscripciones SET estado_inscripcion = $1 WHERE evento = $2 AND socio = $3;", ["pagado", id_evento, socio_id])
                .then(() => console.log("✅ Inscripción pagada"))
                .catch(err => console.error("Error pagando inscripción:", err.message));

            const socio = await obtenerSocio(socio_id);
            const evento = await obtenerEvento(id_evento);

            await crearNotificacion(
                socio_id,
                '¡Inscripción evento!',
                `
                    Hola ${socio.nombre} ${socio.apellidos},<br><br>
                    Tu inscripción al evento <strong>"${evento.nombre_evento}"</strong> ha sido registrada correctamente.<br><br>
                    <strong>📅 Fecha:</strong> ${evento.fecha_evento_inicio} hastas ${evento.fecha_evento_fin}<br>
                    <strong>📍 Lugar:</strong> ${evento.calle}, ${evento.ciudad}<br><br>
                    ¡Gracias por tu participación!<br><br>
                    <em>Sociedad Científica de Desarrollo Informático</em>
                `
            );
        }
    }

    response.status(200).send();
});

module.exports = router;