const pool = require('../database');

async function obtenernRol(usuario) {
    const querySocio = 'SELECT socio_rol FROM SOCIO WHERE email = $1;';
    const resultSocio = (await pool.query(querySocio, [usuario.email]));
    const socio = resultSocio.rows[0];

    const querySocioRol = 'SELECT nombre FROM Socio_Rol WHERE id_socio_rol = $1;';
    const resultSocioRol = (await pool.query(querySocioRol, [socio.socio_rol]));
    const socioRol = resultSocioRol.rows[0];

    return socioRol;
}

async function obtenerSocio(id) {
    const querySocio = 'SELECT * FROM Socio WHERE id_socio = $1;';
    const resultSoscio = (await pool.query(querySocio, [id]));
    const socio = resultSoscio.rows[0];

    return socio;
}

async function obtenerPresidenteComite(comite) {
    const queryPresidenteComite = `SELECT * FROM Miembros_Comite 
                                   WHERE comite = $1 AND 
                                   rol_comite = (
                                   SELECT id_socio_rol FROM Socio_Rol WHERE nombre = 'Presidente');`;
    const resultPresidenteComite = (await pool.query(queryPresidenteComite, [comite]));
    const presidenteComite = resultPresidenteComite.rows[0];

    return presidenteComite;
}


module.exports = {
    obtenernRol,
    obtenerSocio,
    obtenerPresidenteComite
};