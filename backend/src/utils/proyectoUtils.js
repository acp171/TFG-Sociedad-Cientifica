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

module.exports = { 
    obtenerNombreProyecto,
    obtenerPresidenteProyecto
}