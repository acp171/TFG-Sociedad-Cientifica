const pool = require('../database');

async function obtenerNombreComite(id_comite) {
    const queryNombreComite = 'SELECT nombre_comite FROM Comite WHERE id_comite = $1'
    const resultNombreComite = await pool.query(queryNombreComite, [id_comite]);
    const nombreComite = resultNombreComite.rows[0].nombre_proyecto;

    return nombreComite;
}

module.exports = {
    obtenerNombreComite
}