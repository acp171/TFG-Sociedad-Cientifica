const pool = require('../database');
const path = require('path');
const { obtenernRol } = require('../utils/socioUtils');

const createArticulo = async (req, res) => {
    const { titulo, contenido } = req.body;
    let rutaPDF = req.file ? req.file.path : null;

    if (!titulo || (!req.file && !contenido)) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    try {
        let query, values;
        if (req.file && !contenido) {
            values = [titulo, rutaPDF, new Date(), req.usuario.id];
            query = 'INSERT INTO Publicaciones(titulo, contenidoPDF, fecha_publicacion, socio) VALUES($1, $2, $3, $4) RETURNING *;';
        } else if (!req.file && contenido) {
            values = [titulo, contenido, new Date(), req.usuario.id];
            query = 'INSERT INTO Publicaciones(titulo, contenido, fecha_publicacion, socio) VALUES($1, $2, $3, $4) RETURNING *;';
        } else {
            values = [titulo, contenido, rutaPDF, new Date(), req.usuario.id];
            query = 'INSERT INTO Publicaciones(titulo, contenido, contenidoPDF, fecha_publicacion, socio) VALUES($1, $2, $3, $4, $5) RETURNING *;';
        }

        const result = await pool.query(query, values);
        res.status(200).json({ message: 'Artículo científico publicado.', publicacion: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deleteArticulo = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('SELECT socio FROM Publicaciones WHERE id_publicacion = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Publicación no encontrada.' });

        const adminRol = await obtenernRol(req.usuario);
        if ((!adminRol || adminRol.nombre !== 'Administrador') && result.rows[0].socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado.' });
        }

        await pool.query('DELETE FROM Publicaciones WHERE id_publicacion = $1;', [id]);
        res.status(200).json({ message: 'Artículo científico eliminado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getArticulos = async (req, res) => {
    try {
        const query = `SELECT p.*, s.nombre, s.apellidos FROM Publicaciones p JOIN Socio s ON p.socio = s.id_socio ORDER BY p.fecha_publicacion DESC;`;
        const result = await pool.query(query);
        res.status(200).json({ message: 'Listado de artículos.', articulos: { listadoArticulos: result.rows } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getArticuloById = async (req, res) => {
    const id = req.params.id;
    try {
        const resultArticulo = await pool.query(`SELECT p.*, s.nombre, s.apellidos FROM Publicaciones p JOIN Socio s ON p.socio = s.id_socio WHERE p.id_publicacion = $1;`, [id]);
        if (resultArticulo.rows.length === 0) return res.status(404).json({ message: 'Artículo no encontrado.' });

        const resultComentarios = await pool.query(
            `SELECT c.*, s.nombre, s.apellidos FROM Comentario_Publicacion c JOIN Socio s ON c.socio = s.id_socio WHERE c.publicacion = $1 ORDER BY c.fecha_comentario DESC;`,
            [id]
        );
        res.status(200).json({ articulo: resultArticulo.rows[0], comentarios: resultComentarios.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const downloadPDF = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('SELECT contenidopdf FROM Publicaciones WHERE id_publicacion = $1', [id]);
        if (result.rows.length === 0 || !result.rows[0].contenidopdf) return res.status(404).json({ message: "PDF no encontrado" });

        let pdfPath = result.rows[0].contenidopdf;
        if (pdfPath.startsWith('/')) pdfPath = pdfPath.slice(1);
        const absolutePath = path.resolve(__dirname, '..', 'public', pdfPath);

        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(absolutePath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const addComentario = async (req, res) => {
    const publicacion = req.params.id;
    const { comentario } = req.body;
    if (!comentario) return res.status(400).json({ message: 'Falta el comentario.' });

    try {
        const result = await pool.query(
            'INSERT INTO Comentario_Publicacion(comentario, socio, publicacion, fecha_comentario, visibilidad) VALUES($1, $2, $3, $4, $5) RETURNING *;',
            [comentario, req.usuario.id, publicacion, new Date(), true]
        );
        const resultDetailed = await pool.query(
            `SELECT c.*, s.nombre, s.apellidos FROM Comentario_Publicacion c JOIN Socio s ON c.socio = s.id_socio WHERE c.id_comentario = $1;`,
            [result.rows[0].id_comentario]
        );
        res.status(200).json({ message: 'Comentario publicado.', comentario: resultDetailed.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const moderarComentario = async (req, res) => {
    const id_comentario = req.params.id_comentario;
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') return res.status(403).json({ message: 'No autorizado.' });

    try {
        const result = await pool.query('UPDATE Comentario_Publicacion SET visibilidad = NOT visibilidad WHERE id_comentario = $1 RETURNING *;', [id_comentario]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Comentario no encontrado." });
        res.status(200).json({ message: 'Comentario moderado.', comentario: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
    createArticulo,
    deleteArticulo,
    getArticulos,
    getArticuloById,
    downloadPDF,
    addComentario,
    moderarComentario
};
