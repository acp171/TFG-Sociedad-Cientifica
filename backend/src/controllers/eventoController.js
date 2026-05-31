const pool = require('../database');
const stripe = require('../config/stripe');
const { obtenernRol, obtenerSocio } = require('../utils/socioUtils');
const { obtenerMiembrosComiteEvento, obtenerInscripcionesEvento, obtenerEvento } = require("../utils/eventoUtils");
const { obtenerPresidenteComite, obtenerComiteEvento, obtenerComitePorSocio } = require('../utils/comiteUtils');
const { crearNotificacion, crearNotificacionEvento } = require('../utils/notificaciones');
const { encrypt } = require('../utils/cryptoUtils');
const { slugify } = require('../utils/slugify');

const createEvento = async (req, res) => {
    const { nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, direccion, precio } = req.body;
    if (!nombre_evento || !fecha_evento_inicio || !fecha_evento_fin || !descripcion_evento || !direccion) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    const id_comite = await obtenerComitePorSocio(req.usuario.id);
    const adminRol = await obtenernRol(req.usuario);

    if (!adminRol || adminRol.nombre !== 'Administrador') {
        if (!id_comite) return res.status(403).json({ message: 'No autorizado.' });
        const presidenteComite = await obtenerPresidenteComite(id_comite);
        if (presidenteComite.socio !== req.usuario.id) return res.status(403).json({ message: 'No autorizado.' });
    }

    if (new Date(fecha_evento_fin) <= new Date(fecha_evento_inicio)) {
        return res.status(400).json({ message: 'Fecha inválida: la fecha de fin debe ser posterior a la de inicio.' });
    }

    try {
        const direccionObj = JSON.parse(direccion);
        const { calle, ciudad, codigo_postal, provincia, extra, latitud, longitud } = direccionObj;

        const direccionResult = await pool.query(
            `INSERT INTO Direccion (calle, ciudad, codigo_postal, provincia, extra, latitud, longitud) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_direccion;`,
            [calle, ciudad, codigo_postal, provincia, extra || null, latitud || null, longitud || null]
        );
        const id_direccion = direccionResult.rows[0].id_direccion;

        const slug = slugify(nombre_evento);
        const valuesEvento = [nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, parseFloat(precio) || 0, id_direccion, id_comite, slug];
        const resultEvento = await pool.query(
            'INSERT INTO Evento(nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, precio, direccion, comite, slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
            valuesEvento
        );

        await crearNotificacionEvento('Nuevo evento publicado', `Se ha creado un nuevo evento: ${resultEvento.rows[0].nombre_evento}`);
        res.status(200).json({ message: 'Evento científico creado.', evento: resultEvento.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const updateEvento = async (req, res) => {
    const id_evento = req.params.id;
    const { nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, precio } = req.body;

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const id_comite = await obtenerComiteEvento(id_evento);
        const presidenteComite = await obtenerPresidenteComite(id_comite);
        if (presidenteComite.socio !== req.usuario.id) return res.status(403).json({ message: 'No autorizado.' });
    }

    try {
        const query = `UPDATE Evento SET nombre_evento = $1, fecha_evento_inicio = $2, fecha_evento_fin = $3, descripcion_evento = $4, precio = $5 WHERE id_evento = $6 RETURNING *;`;
        const result = await pool.query(query, [nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, parseFloat(precio) || 0, id_evento]);
        res.status(200).json({ message: 'Evento científico editado.', evento: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deleteEvento = async (req, res) => {
    const id_evento = req.params.id;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const id_comite = await obtenerComiteEvento(id_evento);
        const presidenteComite = await obtenerPresidenteComite(id_comite);
        if (presidenteComite.socio !== req.usuario.id) return res.status(403).json({ message: 'No autorizado.' });
    }

    try {
        await pool.query('DELETE FROM Evento WHERE id_evento = $1;', [id_evento]);
        res.status(200).json({ message: 'Evento científico eliminado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getEventos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Evento;');
        res.status(200).json({ message: 'Lista de eventos.', eventos: { listaEventos: result.rows } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getEventoById = async (req, res) => {
    const identifier = req.params.id;
    const isId = /^\d+$/.test(identifier);

    try {
        const queryEvento = `SELECT e.*, d.calle, d.ciudad, d.codigo_postal, d.provincia, d.extra, d.longitud, d.latitud 
                             FROM Evento e 
                             LEFT JOIN Direccion d ON e.direccion = d.id_direccion
                             WHERE ${isId ? 'e.id_evento' : 'e.slug'} = $1;`;
        const resultEvento = await pool.query(queryEvento, [isId ? parseInt(identifier) : identifier]);
        if (resultEvento.rows.length === 0) return res.status(404).json({ message: 'Evento no encontrado.' });

        const evento = resultEvento.rows[0];
        const direccion = {
            calle: evento.calle,
            ciudad: evento.ciudad,
            codigo_postal: evento.codigo_postal,
            provincia: evento.provincia,
            extra: evento.extra,
            longitud: evento.longitud,
            latitud: evento.latitud
        };
        delete evento.calle; delete evento.ciudad; delete evento.codigo_postal; delete evento.provincia; delete evento.extra; delete evento.longitud; delete evento.latitud;

        const miembrosInscritos = await obtenerInscripcionesEvento(evento.id_evento) || [];
        const miembrosComite = evento.comite ? await obtenerMiembrosComiteEvento(evento.comite) : [];

        res.status(200).json({ evento: { ...evento, direccion }, miembrosComite, miembrosIncritos: miembrosInscritos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const inscribirse = async (req, res) => {
    const id_evento = req.params.id;
    const socio_id = req.usuario.id;
    try {
        const eventoResult = await pool.query('SELECT precio FROM Evento WHERE id_evento = $1', [id_evento]);
        const precio = eventoResult.rows[0]?.precio ?? 0;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(precio * 100),
            currency: 'eur',
            payment_method_types: ['card', 'sepa_debit', 'paypal'],
            metadata: { tipo_pago: 'inscripcion_evento', id_evento: id_evento.toString(), socio_id: socio_id.toString() },
        });

        const queryInscripcion = `
            INSERT INTO Inscripciones (estado_inscripcion, evento, socio, payment_intent_id) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (socio, evento) 
            DO UPDATE SET payment_intent_id = EXCLUDED.payment_intent_id, estado_inscripcion = EXCLUDED.estado_inscripcion;
        `;
        await pool.query(queryInscripcion, ["pendiente", id_evento, socio_id, paymentIntent.id]);
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar el pago' });
    }
};

const getMisInscripciones = async (req, res) => {
    try {
        const query = `
            SELECT e.id_evento, e.nombre_evento, e.fecha_evento_inicio, e.fecha_evento_fin, e.descripcion_evento, i.estado_inscripcion
            FROM Inscripciones i
            INNER JOIN Evento e ON i.evento = e.id_evento
            WHERE i.socio = $1;
        `;
        const result = await pool.query(query, [req.usuario.id]);
        res.status(200).json({ inscripciones: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener inscripciones" });
    }
};

const cancelarInscripcion = async (req, res) => {
    const id_evento = req.params.id;
    const socio_id = req.usuario.id;
    try {
        const result = await pool.query("DELETE FROM Inscripciones WHERE evento = $1 AND socio = $2 RETURNING *;", [id_evento, socio_id]);
        if (result.rowCount === 0) return res.status(404).json({ message: "Inscripción no encontrada." });

        const socio = await obtenerSocio(socio_id);
        const evento = await obtenerEvento(id_evento);

        await crearNotificacion(socio_id, '¡Inscripción cancelada!', `Hola ${socio.nombre}, tu inscripción al evento "${evento.nombre_evento}" ha sido cancelada.`);

        const { payment_intent_id, estado_inscripcion } = result.rows[0];
        if (payment_intent_id) {
            try {
                if (estado_inscripcion === 'pagado') {
                    await stripe.refunds.create({ payment_intent: payment_intent_id });
                } else {
                    await stripe.paymentIntents.cancel(payment_intent_id);
                }
            } catch (err) { console.error("Stripe Error:", err.message); }
        }
        res.status(200).json({ message: "Inscripción cancelada correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al cancelar la inscripción." });
    }
};

module.exports = {
    createEvento,
    updateEvento,
    deleteEvento,
    getEventos,
    getEventoById,
    inscribirse,
    getMisInscripciones,
    cancelarInscripcion
};
