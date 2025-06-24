const pool = require('../database');

async function obtenerNombreComite(id_comite) {
    const queryNombreComite = 'SELECT nombre_comite FROM Comite WHERE id_comite = $1'
    const resultNombreComite = await pool.query(queryNombreComite, [id_comite]);
    const nombreComite = resultNombreComite.rows[0].nombre_proyecto;

    return nombreComite;
}

async function obtenerPresidenteComite(id_comite) {
    const queryPresidenteComite = `SELECT * FROM Miembros_Comite 
                                   WHERE comite = $1 AND 
                                   rol_comite = (
                                   SELECT id_socio_rol FROM Socio_Rol WHERE nombre = 'Presidente');`;
    const resultPresidenteComite = await pool.query(queryPresidenteComite, [id_comite]);
    const presidenteComite = resultPresidenteComite.rows[0];

    return presidenteComite;
}

async function obtenerComiteEvento(id_evento) {
    const queryComiteEvento = `SELECT comite FROM Eventos
                               WHERE id_evento = $1;`;
    const resultComiteEvento = await pool.query(queryComiteEvento, [id_evento]);
    const comiteEvento = resultComiteEvento.rows[0];

    return comiteEvento;
}

async function obtenerComitePorSocio(id_socio) {
    const queryComitePorSocio = `SELECT comite FROM Miembros_Comite
                                 WHERE socio = $1;`;
    const resultComitePorSocio = await pool.query(queryComitePorSocio, [id_socio]);
    const comitePorSocio = resultComitePorSocio.rows[0];

    return comitePorSocio;
}

module.exports = {
    obtenerNombreComite,
    obtenerPresidenteComite,
    obtenerComiteEvento,
    obtenerComitePorSocio
}