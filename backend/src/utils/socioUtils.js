const pool = require('../database');

async function obtenernRol(usuario) {
    const querySocio = 'SELECT socio_rol FROM SOCIO WHERE email = $1;';
    const resultSocio = await pool.query(querySocio, [usuario.email]);
    const socio = resultSocio.rows[0];

    const querySocioRol = 'SELECT nombre FROM Socio_Rol WHERE id_socio_rol = $1;';
    const resultSocioRol = await pool.query(querySocioRol, [socio.socio_rol]);
    const socioRol = resultSocioRol.rows[0];

    return socioRol;
}

async function obtenerSocio(id) {
    const querySocio = 'SELECT * FROM Socio WHERE id_socio = $1;';
    const resultSocio = await pool.query(querySocio, [id]);
    const socio = resultSocio.rows[0];

    return socio;
}

async function obtenerSocios() {
    const querySocios = `SELECT s.id_socio, s.nombre, s.apellidos, s.email, s.telefono,
                         s.fecha_nacimiento, s.fecha_alta, ts.nombre_tipo AS plan, sr.nombre AS socio_rol
                         FROM Socio s
                         JOIN Socio_Rol sr ON s.socio_rol = sr.id_socio_rol
                         JOIN Tipo_Socio ts ON s.tipo_socio = ts.id_tipo_socio;`;
    const socios = await pool.query(querySocios);

    return socios.rows;
}


module.exports = {
    obtenernRol,
    obtenerSocio,
    obtenerSocios
};