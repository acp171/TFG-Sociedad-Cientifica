const pool = require('../database');
const { obtenernRol } = require('../utils/socioUtils');
const { crearNotificacion, crearNotificacionSocio } = require('../utils/notificaciones');

const sendNotificacionToSocio = async (req, res) => {
    const { id_socio, titulo, notificacion } = req.body;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });
    if (!titulo || !notificacion) return res.status(400).json({ message: 'Faltan datos.' });

    try {
        await crearNotificacion(id_socio, titulo, notificacion);
        res.status(200).json({ message: 'Notificación enviada al socio.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const sendNotificacionContacto = async (req, res) => {
    const { email, titulo, mensaje } = req.body;
    if (req.usuario.email !== email) return res.status(403).json({ message: 'Correo incorrecto.' });
    if (!titulo || !mensaje) return res.status(400).json({ message: 'Faltan datos.' });

    try {
        await crearNotificacionSocio(titulo, mensaje);
        res.status(200).json({ message: 'Notificación enviada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getMisNotificaciones = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Notificaciones WHERE socio = $1 ORDER BY fecha_envio DESC;', [req.usuario.id]);
        res.status(200).json({ message: 'Mis notificaciones.', notificaciones: { listadoNotificaciones: result.rows } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getMisNotificacionesSinLeer = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Notificaciones WHERE socio = $1 AND estado_lectura = FALSE ORDER BY fecha_envio DESC;', [req.usuario.id]);
        res.status(200).json({ message: 'Mis notificaciones sin leer.', notificaciones: { listadoNotificaciones: result.rows } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getAllNotificaciones = async (req, res) => {
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });

    try {
        const result = await pool.query('SELECT * FROM Notificaciones;');
        res.status(200).json({ message: 'Listado de todas las notificaciones.', notificaciones: { listadoNotificaciones: result.rows } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const markAsRead = async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query('UPDATE Notificaciones SET estado_lectura = TRUE WHERE id_notificacion = $1', [id]);
        res.status(200).json({ message: 'Notificación marcada como leída.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = { sendNotificacionToSocio, sendNotificacionContacto, getMisNotificaciones, getMisNotificacionesSinLeer, getAllNotificaciones, markAsRead };
