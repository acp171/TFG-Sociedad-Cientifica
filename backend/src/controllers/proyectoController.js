const pool = require('../database');
const { obtenernRol } = require('../utils/socioUtils');
const { obtenerNombreProyecto, obtenerPresidenteProyecto, obtenerMiembro } = require('../utils/proyectoUtils');
const { crearNotificacion } = require('../utils/notificaciones');

const createProyecto = async (req, res) => {
    const { nombre_proyecto, descripcion, fecha_inicio, fecha_fin } = req.body;
    if (!nombre_proyecto || !descripcion || !fecha_fin) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    const fecha_inicio_date = fecha_inicio ? new Date(fecha_inicio) : new Date();
    const fecha_fin_Date = new Date(fecha_fin);
    const fecha_actual = new Date();

    if (fecha_actual > fecha_inicio_date) {
        return res.status(400).json({ message: 'No es posible seleccionar esa fecha de inicio.' });
    }

    let estado = "Pendiente";
    if (fecha_actual >= fecha_inicio_date && fecha_actual <= fecha_fin_Date) {
        estado = "En curso";
    }

    if (fecha_fin_Date > fecha_inicio_date) {
        try {
            const valuesProyecto = [nombre_proyecto, descripcion, fecha_inicio_date, fecha_fin_Date, estado];
            const queryProyecto = 'INSERT INTO Proyectos_Investigacion(nombre_proyecto, descripcion, fecha_inicio, fecha_fin, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
            const resultProyecto = await pool.query(queryProyecto, valuesProyecto);

            const valuesMiembro = [fecha_actual, req.usuario.id, resultProyecto.rows[0].id_proyecto, 2];
            const queryMiembro = 'INSERT INTO Socio_Proyecto(fecha_registro, socio, proyecto, rol_proyecto) VALUES ($1, $2, $3, $4);';
            await pool.query(queryMiembro, valuesMiembro);

            res.status(200).json({
                message: 'Proyecto de investigación creado.',
                proyecto: { ...resultProyecto.rows[0], presidente: req.usuario.nombre + ' es presidente.' }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    } else {
        res.status(403).json({ message: 'Fecha fin inválida.' });
    }
};

const updateProyecto = async (req, res) => {
    const id = req.params.id;
    const { nombre_proyecto, descripcion, fecha_inicio, fecha_fin } = req.body;

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteProyecto = await obtenerPresidenteProyecto(id);
        if (presidenteProyecto.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
    }

    if (!nombre_proyecto || nombre_proyecto.trim() === "") {
        return res.status(400).json({ message: "El título es obligatorio." });
    }

    const fecha_inicio_date = new Date(fecha_inicio);
    const fecha_fin_Date = new Date(fecha_fin);
    const fecha_actual = new Date();

    let estado = "Terminado";
    if (fecha_actual < fecha_inicio_date) {
        estado = "Pendiente";
    } else if (fecha_actual >= fecha_inicio_date && fecha_actual <= fecha_fin_Date) {
        estado = "En curso";
    }

    try {
        const query = `UPDATE Proyectos_Investigacion SET nombre_proyecto = $1, descripcion = $2, fecha_inicio = $3, fecha_fin = $4, estado = $5 WHERE id_proyecto = $6 RETURNING *;`;
        const values = [nombre_proyecto.trim(), descripcion || null, fecha_inicio || null, fecha_fin || null, estado, id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) return res.status(404).json({ message: "Proyecto no encontrado." });
        res.status(200).json({ message: "Proyecto actualizado correctamente.", proyecto: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const deleteProyecto = async (req, res) => {
    const id_proyecto = req.params.id;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteProyecto = await obtenerPresidenteProyecto(id_proyecto);
        if (presidenteProyecto.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
    }

    try {
        await pool.query('DELETE FROM Proyectos_Investigacion WHERE id_proyecto = $1;', [id_proyecto]);
        res.status(200).json({ message: 'Proyecto de investigación eliminado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getProyectos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Proyectos_Investigacion;');
        res.status(200).json({ message: 'Lista de proyectos.', proyectos: { listaProyectos: result.rows } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getProyectoById = async (req, res) => {
    const id = req.params.id;
    try {
        const resultProyecto = await pool.query('SELECT * FROM Proyectos_Investigacion WHERE id_proyecto = $1;', [id]);
        if (resultProyecto.rows.length === 0) return res.status(404).json({ message: "Proyecto no encontrado." });

        const queryMiembros = `
            SELECT s.id_socio, s.nombre, s.apellidos, r.nombre AS rol, sp.fecha_registro
            FROM Socio_Proyecto sp
            JOIN Socio s ON sp.socio = s.id_socio
            JOIN Socio_Rol r ON sp.rol_proyecto = r.id_socio_rol
            WHERE sp.proyecto = $1;
        `;
        const resultMiembros = await pool.query(queryMiembros, [id]);

        res.status(200).json({ proyecto: resultProyecto.rows[0], miembros: resultMiembros.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const addMiembro = async (req, res) => {
    const { socio, rol_proyecto } = req.body;
    const proyecto = req.params.id;
    if (!socio || !rol_proyecto) return res.status(400).json({ message: 'Faltan datos.' });

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteProyecto = await obtenerPresidenteProyecto(proyecto);
        if (presidenteProyecto.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
    }

    try {
        const values = [new Date(), socio, proyecto, rol_proyecto];
        await pool.query('INSERT INTO Socio_Proyecto(fecha_registro, socio, proyecto, rol_proyecto) VALUES ($1, $2, $3, $4);', values);

        const nombreProyecto = await obtenerNombreProyecto(proyecto);
        await crearNotificacion(socio, 'Has sido añadido a un proyecto', `Fuiste añadido al proyecto "${nombreProyecto}".`);

        const nuevoMiembro = await obtenerMiembro(proyecto, socio);
        res.status(200).json({ message: 'Miembro añadido.', miembro: nuevoMiembro });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const removeMiembro = async (req, res) => {
    const proyecto = req.params.id;
    const id_socio = req.params.id_socio;

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteProyecto = await obtenerPresidenteProyecto(proyecto);
        if (presidenteProyecto.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
    }

    try {
        await pool.query('DELETE FROM Socio_Proyecto WHERE socio = $1 AND proyecto = $2;', [id_socio, proyecto]);
        const nombreProyecto = await obtenerNombreProyecto(proyecto);
        await crearNotificacion(id_socio, 'Has sido expulsado del proyecto.', `Fuiste expulsado del proyecto "${nombreProyecto}".`);
        res.status(200).json({ message: 'Miembro expulsado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
    createProyecto,
    updateProyecto,
    deleteProyecto,
    getProyectos,
    getProyectoById,
    addMiembro,
    removeMiembro
};
