const pool = require('../database');

async function obtenerMiembrosComiteEvento(comite) {
    const queryMiembros = `
        SELECT 
            s.id_socio,
            s.nombre,
            s.apellidos,
            sr.nombre AS rol
        FROM Miembros_Comite mc
        JOIN Socio s ON mc.socio = s.id_socio
        JOIN Socio_Rol sr ON mc.rol_comite = sr.id_socio_rol
        WHERE mc.comite = $1;
    `;
    const resultMiembros = await pool.query(queryMiembros, [comite]);
    const miembrosComite = resultMiembros.rows;

    return miembrosComite;
}

async function obtenerInscripcionesEvento(evento) {
    const queryInscripciones = `SELECT socio
                                FROM Inscripciones
                                WHERE evento = $1 AND estado_inscripcion = 'pagado';`;
    const resultInscripciones = await pool.query(queryInscripciones, [evento]);
    const miembrosInscripciones = resultInscripciones.rows;

    return miembrosInscripciones;
}

module.exports = {
    obtenerMiembrosComiteEvento,
    obtenerInscripcionesEvento
}