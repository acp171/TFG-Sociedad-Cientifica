const express = require("express");
const router = express.Router();
const pool = require('../database');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Comprobar pago
router.post('/', express.raw({ type: 'application/json' }), (request, response) => {
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

        pool.query("UPDATE Inscripciones SET estado_inscripcion = $1 WHERE evento = $2 AND socio = $3;", ["pagado", id_evento, socio_id])
            .then(() => console.log("✅ Inscripción pagada"))
            .catch(err => console.error("Error pagando inscripción:", err.message));
    }

    response.status(200).send();
});

module.exports = router;