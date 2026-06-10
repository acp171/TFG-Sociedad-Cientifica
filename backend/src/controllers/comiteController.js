const pool = require('../database');
const { obtenernRol, obtenerSocio } = require('../utils/socioUtils');
const { obtenerNombreComite, obtenerPresidenteComite } = require('../utils/comiteUtils');
const { crearNotificacion } = require('../utils/notificaciones');

const createComite = async (req, res) => {
    const { nombre_comite, descripcion, socio } = req.body;
    if (!nombre_comite || !descripcion || !socio) return res.status(400).json({ message: 'Faltan datos.' });

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });

    try {
        const resultComite = await pool.query('INSERT INTO Comite(nombre_comite, descripcion, fecha_creacion) VALUES ($1, $2, $3) RETURNING *;', [nombre_comite, descripcion, new Date()]);
        const id_comite = resultComite.rows[0].id_comite;

        await pool.query('INSERT INTO Miembros_Comite(fecha_registro, socio, comite, rol_comite) VALUES ($1, $2, $3, $4);', [new Date(), socio, id_comite, "2"]);
        const socioPresidente = await obtenerSocio(socio);

        res.status(200).json({ message: 'Comité científico creado.', comite: { ...resultComite.rows[0], presidente: socioPresidente.nombre + ' ' + socioPresidente.apellidos + ' es el Presidente.' } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const addMiembro = async (req, res) => {
    const { socio, comite, rol_comite } = req.body;
    if (!socio || !comite || !rol_comite) return res.status(400).json({ message: 'Faltan datos.' });

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteComite = await obtenerPresidenteComite(comite);
        if (!presidenteComite || presidenteComite.socio !== req.usuario.id) return res.status(403).json({ message: 'No autorizado.' });
    }

    try {
        const result = await pool.query('INSERT INTO Miembros_Comite(fecha_registro, socio, comite, rol_comite) VALUES ($1, $2, $3, $4) RETURNING *;', [new Date(), socio, comite, rol_comite]);
        const nombreComite = await obtenerNombreComite(comite);
        await crearNotificacion(socio, 'Has sido añadido a un comité científico', `Fuiste añadido al comité "${nombreComite}".`);
        res.status(200).json({ message: 'Miembro añadido.', comite: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const removeMiembro = async (req, res) => {
    const { socio, comite } = req.body;
    if (!socio || !comite) return res.status(400).json({ message: 'Faltan datos.' });

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteComite = await obtenerPresidenteComite(comite);
        if (!presidenteComite || presidenteComite.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado.' });
        }
    }

    try {
        await pool.query('DELETE FROM Miembros_Comite WHERE socio = $1 AND comite = $2;', [socio, comite]);
        const nombreComite = await obtenerNombreComite(comite);
        await crearNotificacion(socio, 'Has sido expulsado de un comité científico', `Fuiste expulsado del comité "${nombreComite}".`);
        res.status(200).json({ message: 'Miembro expulsado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deleteComite = async (req, res) => {
    const id_comite = req.params.id;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado.' });
    }

    try {
        await pool.query('DELETE FROM Comite WHERE id_comite = $1;', [id_comite]);
        res.status(200).json({ message: 'Comité científico eliminado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getComites = async (req, res) => {
    try {
        const query = `
            SELECT C.*, S.id_socio, S.nombre AS nombre_socio, S.apellidos, SR.nombre AS rol
            FROM Comite C
            LEFT JOIN Miembros_Comite MC ON C.id_comite = MC.comite
            LEFT JOIN Socio S ON MC.socio = S.id_socio
            LEFT JOIN Socio_Rol SR ON MC.rol_comite = SR.id_socio_rol
            ORDER BY C.id_comite;
        `;
        const result = await pool.query(query);
        const comites = {};
        result.rows.forEach(row => {
            if (!comites[row.id_comite]) {
                comites[row.id_comite] = { id_comite: row.id_comite, nombre_comite: row.nombre_comite, descripcion: row.descripcion, miembros: [] };
            }
            if (row.id_socio) {
                comites[row.id_comite].miembros.push({ id_socio: row.id_socio, nombre_socio: row.nombre_socio + ' ' + row.apellidos, rol: row.rol });
            }
        });
        res.status(200).json({ message: 'Listado de comités.', listadoComites: Object.values(comites) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getMensajes = async (req, res) => {
    const id_comite = req.params.id;
    try {
        const query = `
            SELECT cm.*, s.nombre, s.apellidos FROM Comite_Mensajes cm
            JOIN Socio s ON cm.socio_id = s.id_socio
            WHERE cm.comite_id = $1 ORDER BY cm.fecha_envio ASC;
        `;
        const result = await pool.query(query, [id_comite]);
        res.status(200).json({ mensajes: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const sendMensaje = async (req, res) => {
    const id_comite = req.params.id;
    const socio_id = req.usuario.id;
    const { mensaje } = req.body;
    if (!mensaje || mensaje.trim() === '') return res.status(400).json({ message: 'El mensaje no puede estar vacío.' });

    try {
        const authResult = await pool.query('SELECT * FROM Miembros_Comite WHERE comite = $1 AND socio = $2;', [id_comite, socio_id]);
        const amIAdmin = (await obtenernRol(req.usuario))?.nombre === 'Administrador';

        if (authResult.rows.length === 0 && !amIAdmin) return res.status(403).json({ message: 'No perteneces a este comité.' });

        const result = await pool.query('INSERT INTO Comite_Mensajes (comite_id, socio_id, mensaje) VALUES ($1, $2, $3) RETURNING *;', [id_comite, socio_id, mensaje]);
        res.status(201).json({ message: 'Mensaje enviado.', mensaje: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
    createComite,
    addMiembro,
    removeMiembro,
    deleteComite,
    getComites,
    getMensajes,
    sendMensaje
};
