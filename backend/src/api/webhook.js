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

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const id_evento = paymentIntent.metadata.id_evento;
        const socio_id = paymentIntent.metadata.socio_id;

        const tipoPago = paymentIntent.metadata.tipo_pago;
        if (tipoPago === 'registro_socio') {
            const { nombre, apellidos, email, password, telefono, fecha_nacimiento, id_plan } = paymentIntent.metadata;

            const query = `INSERT INTO Socio(nombre, apellidos, email, password, telefono, 
                            fecha_nacimiento, fecha_alta, fecha_expiracion, socio_rol, tipo_socio)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP + INTERVAL '30 days', $8, $9) RETURNING id_socio, nombre, email;`;

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
        else if (tipoPago === 'renovacion_socio') {
            try {
                // Si la fecha ya ha pasado, la configuramos a hoy + 30 días. 
                // Si aún no ha pasado, le sumamos 30 días a lo que le quede.
                const query = `
                    UPDATE Socio 
                    SET fecha_expiracion = CASE 
                        WHEN fecha_expiracion < CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP + INTERVAL '30 days' 
                        ELSE fecha_expiracion + INTERVAL '30 days' 
                    END
                    WHERE id_socio = $1;
                `;
                await pool.query(query, [socio_id]);
                console.log("✅ Suscripción renovada para socio: ", socio_id);

                await crearNotificacion(
                    socio_id,
                    'Renovación completada',
                    'Gracias por renovar tu suscripción mensual. Tienes acceso completo por 30 días más.'
                );
            } catch (error) {
                console.error("Error renovando socio: ", error.message);
            }
        }
        else if (tipoPago === 'inscripcion_evento') {
            await pool.query("UPDATE Inscripciones SET estado_inscripcion = $1 WHERE evento = $2 AND socio = $3;", ["pagado", id_evento, socio_id])
                .then(() => console.log("✅ Inscripción pagada"))
                .catch(err => console.error("Error pagando inscripción:", err.message));

            const socio = await obtenerSocio(socio_id);
            const evento = await obtenerEvento(id_evento);

            const formatFecha = (f) => new Date(f).toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            await crearNotificacion(
                socio_id,
                '¡Inscripción evento!',
                `
                    Hola ${socio.nombre} ${socio.apellidos},<br><br>
                    Tu inscripción al evento <strong>"${evento.nombre_evento}"</strong> ha sido registrada correctamente.<br><br>
                    <strong>📅 Fecha:</strong> ${formatFecha(evento.fecha_evento_inicio)} hasta ${formatFecha(evento.fecha_evento_fin)}<br>
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