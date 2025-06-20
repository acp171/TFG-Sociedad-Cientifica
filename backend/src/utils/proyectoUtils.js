const pool = require('../database');

async function obtenerNombreProyecto(id_proyecto) {
    const queryNombreProyecto = 'SELECT nombre_proyecto FROM Proyectos_Investigacion WHERE id_proyecto = $1'
    const resultNombreProyecto = await pool.query(queryNombreProyecto, [id_proyecto]);
    const nombreProyecto = resultNombreProyecto.rows[0].nombre_proyecto;

    return nombreProyecto;
}

async function obtenerPresidenteProyecto(proyecto) {
    const queryPresidenteProyecto = `SELECT * FROM Socio_Proyecto 
                                   WHERE proyecto = $1 AND 
                                   rol_proyecto = (
                                   SELECT id_socio_rol FROM Socio_Rol WHERE nombre = 'Presidente');`;
    const resultPresidenteProyecto = await pool.query(queryPresidenteProyecto, [proyecto]);
    const presidenteProyecto = resultPresidenteProyecto.rows[0];

    return presidenteProyecto;
}

async function obtenerMiembro(id_proyecto, id_socio) {
    const queryMiembros = `SELECT sp.fecha_registro, s.id_socio, s.nombre, s.apellidos, sr.nombre as rol
                           FROM Socio_Proyecto sp 
                           JOIN Socio s ON sp.socio = s.id_socio 
                           JOIN Socio_Rol sr ON sp.rol_proyecto = sr.id_socio_rol 
                           WHERE sp.proyecto = $1 AND sp.socio = $2`;
    const resultMiembros = await pool.query(queryMiembros, [id_proyecto, id_socio]);
    const miembro = resultMiembros.rows[0];

    return miembro;
}

module.exports = { 
    obtenerNombreProyecto,
    obtenerPresidenteProyecto,
    obtenerMiembro
}