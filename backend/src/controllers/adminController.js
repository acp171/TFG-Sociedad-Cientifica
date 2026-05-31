const pool = require('../database');
const { obtenernRol } = require('../utils/socioUtils');

const asignarRol = async (req, res) => {
    const { id_socio, rol, proyecto, comite, funcion } = req.body;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });

    try {
        let query, values;
        switch (funcion) {
            case 'socio':
                query = 'UPDATE Socio SET socio_rol = $1 WHERE id_socio = $2;';
                values = [rol, id_socio];
                break;
            case 'comite':
                query = 'UPDATE Miembros_Comite SET rol_comite = $1 WHERE socio = $2 AND comite = $3;';
                values = [rol, id_socio, comite];
                break;
            case 'proyecto':
                query = 'UPDATE Socio_Proyecto SET rol_proyecto = $1 WHERE socio = $2 AND proyecto = $3;';
                values = [rol, id_socio, proyecto];
                break;
        }
        await pool.query(query, values);
        res.status(200).json({ message: 'Rol asignado.', socio: { id: id_socio, rol } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const eliminarRol = async (req, res) => {
    const { id_socio, proyecto, comite, funcion } = req.body;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });

    try {
        let query, values;
        switch (funcion) {
            case 'socio':
                query = 'DELETE FROM Socio WHERE id_socio = $1;';
                values = [id_socio];
                break;
            case 'comite':
                query = 'DELETE FROM Miembros_Comite WHERE socio = $1 AND comite = $2;';
                values = [id_socio, comite];
                break;
            case 'proyecto':
                query = 'DELETE FROM Socio_Proyecto WHERE socio = $1 AND proyecto = $2;';
                values = [id_socio, proyecto];
                break;
        }
        await pool.query(query, values);
        res.status(200).json({ message: 'Rol eliminado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getRoles = async (req, res) => {
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });
    try {
        const result = await pool.query('SELECT id_socio_rol AS id, nombre FROM Socio_Rol;');
        res.status(200).json({ message: 'Roles.', roles: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const createRol = async (req, res) => {
    const { nombre } = req.body;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });
    try {
        const result = await pool.query('INSERT INTO Socio_Rol(nombre) VALUES ($1) RETURNING *;', [nombre]);
        res.status(200).json({ message: 'Rol creado.', roles: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const updateRol = async (req, res) => {
    const { nombre } = req.body;
    const id = req.params.id;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });
    try {
        const result = await pool.query('UPDATE Socio_Rol SET nombre = $1 WHERE id_socio_rol = $2 RETURNING *;', [nombre, id]);
        res.status(200).json({ message: 'Rol actualizado.', roles: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deleteRol = async (req, res) => {
    const id = req.params.id;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });
    try {
        await pool.query('DELETE FROM Socio_Rol WHERE id_socio_rol = $1;', [id]);
        res.status(200).json({ message: 'Rol borrado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getTipos = async (req, res) => {
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });
    try {
        const result = await pool.query('SELECT * FROM Tipo_Socio;');
        res.status(200).json({ message: 'Tipos de socios.', tipos: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const createTipo = async (req, res) => {
    const { nombre_tipo, descripcion, cuota, price_stripe } = req.body;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });
    try {
        const result = await pool.query('INSERT INTO Tipo_Socio(nombre_tipo, descripcion, cuota, price_stripe) VALUES ($1, $2, $3, $4) RETURNING *;', [nombre_tipo, descripcion, cuota, price_stripe]);
        res.status(200).json({ message: 'Tipo socio creado.', tipo: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const updateTipo = async (req, res) => {
    const { nombre_tipo, descripcion, cuota, price_stripe } = req.body;
    const id = req.params.id;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });
    try {
        const result = await pool.query('UPDATE Tipo_Socio SET nombre_tipo = $1, descripcion = $2, cuota = $3, price_stripe = $4 WHERE id_tipo_socio = $5 RETURNING *;', [nombre_tipo, descripcion, cuota, price_stripe, id]);
        res.status(200).json({ message: 'Tipo socio actualizado.', tipo: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deleteTipo = async (req, res) => {
    const id = req.params.id;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });
    try {
        await pool.query('DELETE FROM Tipo_Socio WHERE id_tipo_socio = $1;', [id]);
        res.status(200).json({ message: 'Tipo socio borrado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const buscarCalles = async (req, res) => {
    const { provincia, query } = req.query;
    if (!provincia || !query) return res.status(400).json({ message: 'Faltan parámetros' });

    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${query}, ${provincia}, España`)}&format=json&addressdetails=1&limit=10`;
        const response = await fetch(url, { headers: { 'User-Agent': 'TuApp/1.0' } });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
    asignarRol,
    eliminarRol,
    getRoles, createRol,
    updateRol,
    deleteRol,
    getTipos,
    createTipo,
    updateTipo,
    deleteTipo,
    buscarCalles
};
