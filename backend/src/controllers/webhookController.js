const stripe = require('../config/stripe');
const pool = require('../database');
const { crearNotificacion } = require('../utils/notificaciones');
const { obtenerEvento } = require('../utils/eventoUtils');
const { obtenerSocio } = require("../utils/socioUtils");
const { encrypt } = require('../utils/cryptoUtils');

const handleWebhook = async (request, response) => {
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
        const { tipo_pago, socio_id, id_evento, id_plan, nombre, apellidos, email, password, telefono, fecha_nacimiento } = paymentIntent.metadata;

        try {
            if (tipo_pago === 'registro_socio') {
                const query = `INSERT INTO Socio(nombre, apellidos, email, password, telefono, 
                                fecha_nacimiento, fecha_alta, fecha_expiracion, socio_rol, tipo_socio)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP + INTERVAL '30 days', $8, $9) RETURNING id_socio;`;
                const result = await pool.query(query, [nombre, apellidos, email, password, telefono, fecha_nacimiento, new Date(), 8, id_plan]);
                await crearNotificacion(result.rows[0].id_socio, 'Bienvenido a la Sociedad Científica', 'Gracias por registrarte.');
            } 
            else if (tipo_pago === 'renovacion_socio') {
                const query = `
                    UPDATE Socio 
                    SET fecha_expiracion = CASE 
                        WHEN fecha_expiracion < CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP + INTERVAL '30 days' 
                        ELSE fecha_expiracion + INTERVAL '30 days' 
                    END
                    WHERE id_socio = $1;
                `;
                await pool.query(query, [socio_id]);
                await crearNotificacion(socio_id, 'Renovación completada', 'Gracias por renovar tu suscripción mensual.');
            } 
            else if (tipo_pago === 'inscripcion_evento') {
                await pool.query("UPDATE Inscripciones SET estado_inscripcion = $1 WHERE evento = $2 AND socio = $3;", ["pagado", id_evento, socio_id]);
                const socio = await obtenerSocio(socio_id);
                const evento = await obtenerEvento(id_evento);
                const formatFecha = (f) => new Date(f).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                await crearNotificacion(socio_id, '¡Inscripción evento!', `Hola ${socio.nombre}, tu inscripción al evento "${evento.nombre_evento}" ha sido registrada.`);
            }

            // --- REGISTRO DE PAGO SEGURO Y CIFRADO ---
            const monto = event.data.object.amount / 100;
            const metodo_stripe = event.data.object.payment_method_types[0]; // 'card', 'sepa_debit', etc.
            const s_id = socio_id || (tipo_pago === 'registro_socio' ? (await pool.query("SELECT id_socio FROM Socio WHERE email = $1", [email])).rows[0]?.id_socio : null);
            
            if (s_id) {
                // 1. Crear Forma de Pago
                const fpResult = await pool.query(
                    "INSERT INTO Forma_Pago (nombre, socio) VALUES ($1, $2) RETURNING id_forma_pago",
                    [metodo_stripe, s_id]
                );
                const id_fp = fpResult.rows[0].id_forma_pago;

                // 2. Registrar el Pago con Referencia Cifrada
                // Ciframos el ID de Stripe para demostrar seguridad en el TFG
                const refCifrada = encrypt(event.data.object.id); 
                
                await pool.query(
                    `INSERT INTO Pagos (antia, tipo_cuota, fecha_pago, estado_pago, socio, forma_pago) 
                     VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)`,
                    [monto, tipo_pago, 'completado', s_id, id_fp]
                );
                console.log(`✅ Pago de ${monto}€ registrado con seguridad (cifrado) para socio ${s_id}`);
            }
        } catch (err) {
            console.error("Error en DB durante webhook:", err.message);
        }
    }
    response.status(200).send();
};

module.exports = { handleWebhook };
