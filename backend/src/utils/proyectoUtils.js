const pool = require('../database');

async function obtenerNombreProyecto(id_proyecto) {
    const queryNombreProyecto = 'SELECT nombre_proyecto FROM Proyectos_Investigacion WHERE id_proyecto = $1'
    const resultNombreProyecto = await pool.query(queryNombreProyecto, [id_proyecto]);
    const nombreProyecto = resultNombreProyecto.rows[0].nombre_proyecto;

    return nombreProyecto;
}

module.exports = { 
    obtenerNombreProyecto
}