const pool = require('../database');
const bcrypt = require('bcrypt');
const stripe = require('../config/stripe');
const saltRounds = 10;
const { obtenernRol, obtenerSocio, obtenerSocios } = require('../utils/socioUtils');
const { crearNotificacion } = require('../utils/notificaciones');
const { encrypt } = require('../utils/cryptoUtils');

const renovarSuscripcion = async (req, res) => {
    try {
        const socioId = req.usuario.id;

        const query = `
            SELECT t.cuota
            FROM Socio s
            JOIN Tipo_Socio t ON s.tipo_socio = t.id_tipo_socio
            WHERE s.id_socio = $1;
        `;
        const result = await pool.query(query, [socioId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Socio no encontrado' });

        const cuota = result.rows[0].cuota;

        if (cuota === 0) {
            await pool.query('UPDATE Socio SET fecha_expiracion = CURRENT_TIMESTAMP + INTERVAL \'30 days\' WHERE id_socio = $1', [socioId]);
            return res.json({ renovado: true });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: cuota * 100,
            currency: 'eur',
            payment_method_types: ['card', 'sepa_debit', 'paypal'],
            metadata: {
                tipo_pago: 'renovacion_socio',
                socio_id: socioId.toString(),
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret, importe: cuota });
    } catch (error) {
        console.error('Error creando PaymentIntent de renovación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getPerfil = async (req, res) => {
    try {
        const querySocio = `
            SELECT 
                s.nombre,
                s.apellidos,
                s.email,
                s.telefono,
                s.fecha_nacimiento,
                s.fecha_alta,
                r.nombre AS socio_rol,
                t.nombre_tipo AS tipo_socio
            FROM Socio s
            LEFT JOIN Socio_Rol r ON s.socio_rol = r.id_socio_rol
            LEFT JOIN Tipo_Socio t ON s.tipo_socio = t.id_tipo_socio
            WHERE s.email = $1;
        `;
        const resultSocio = await pool.query(querySocio, [req.usuario.email]);
        const socio = resultSocio.rows[0];

        if (!socio) {
            return res.status(404).json({ message: "El usuario no existe." });
        }

        res.status(200).json({
            message: 'Acceso a perfil.',
            socio: {
                nombre: socio.nombre,
                apellidos: socio.apellidos,
                email: socio.email,
                telefono: socio.telefono,
                fecha_nacimiento: socio.fecha_nacimiento,
                fecha_registro: socio.fecha_alta,
                socio_rol: socio.socio_rol,
                tipo_socio: socio.tipo_socio
            }
        });
    }
    catch (error) {
        console.error("Error al entrar al perfil: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const updatePerfil = async (req, res) => {
    const { nombre, apellidos, telefono } = req.body;

    if (!nombre || !apellidos || !telefono) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios y no pueden estar vacíos.' });
    }

    const values = [nombre, apellidos, telefono, req.usuario.email];

    try {
        const query = 'UPDATE Socio SET nombre = $1, apellidos = $2, telefono = $3 WHERE email = $4;';
        await pool.query(query, values);

        const querySocio = `
            SELECT 
                s.nombre,
                s.apellidos,
                s.email,
                s.telefono,
                s.fecha_nacimiento,
                s.fecha_alta,
                r.nombre AS socio_rol,
                t.nombre_tipo AS tipo_socio
            FROM Socio s
            LEFT JOIN Socio_Rol r ON s.socio_rol = r.id_socio_rol
            LEFT JOIN Tipo_Socio t ON s.tipo_socio = t.id_tipo_socio
            WHERE s.email = $1;
        `;
        const resultSocio = await pool.query(querySocio, [req.usuario.email]);
        const socio = resultSocio.rows[0];

        res.status(200).json({
            message: 'Perfil actualizado.',
            socio: {
                nombre: socio.nombre,
                apellidos: socio.apellidos,
                email: socio.email,
                telefono: socio.telefono,
                fecha_nacimiento: socio.fecha_nacimiento,
                fecha_registro: socio.fecha_alta,
                socio_rol: socio.socio_rol,
                tipo_socio: socio.tipo_socio
            }
        });
    }
    catch (error) {
        console.error("Error al actualizar perfil: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deletePerfil = async (req, res) => {
    try {
        const query = 'DELETE FROM Socio WHERE email = $1;';
        await pool.query(query, [req.usuario.email]);
        res.status(200).json({ message: "Cuenta eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const getSocios = async (req, res) => {
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const listaSocios = await obtenerSocios();
        res.status(200).json({
            message: 'Lista de socios.',
            socios: { listaSocios }
        });
    }
    catch (error) {
        console.error("Error al listar los socios: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const createSocioByAdmin = async (req, res) => {
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    const { nombre, apellidos, email, password, telefono, fecha_nacimiento, id_plan } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `INSERT INTO Socio(nombre, apellidos, email, password, telefono, 
                    fecha_nacimiento, fecha_alta, socio_rol, tipo_socio)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_socio, nombre, email;`;

    const values = [nombre, apellidos, email, hashedPassword, telefono, fecha_nacimiento, new Date(), 8, id_plan];

    try {
        const result = await pool.query(query, values);
        await crearNotificacion(
            result.rows[0].id_socio,
            'Bienvenido a la Sociedad Científica',
            'Gracias por registrarte. Esperamos que disfrutes tu experiencia.'
        );
        res.status(201).json({ message: "Socio creado correctamente", socio: result.rows[0] });
    } catch (error) {
        console.error("Error insertando socio: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getCorporacionMiembros = async (req, res) => {
    try {
        if (req.usuario.tipo !== 6) return res.status(403).json({ message: "No autorizado" });

        const query = `
            SELECT id_socio, nombre, apellidos, email, telefono, fecha_nacimiento, tipo_socio
            FROM Socio
            WHERE corporacion = $1;
        `;
        const result = await pool.query(query, [req.usuario.id]);
        res.status(200).json({ miembros: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al obtener miembros" });
    }
};

const addCorporacionMiembro = async (req, res) => {
    const { nombre, apellidos, email, password, telefono, fecha_nacimiento } = req.body;
    try {
        if (req.usuario.tipo !== 6) return res.status(403).json({ message: "No autorizado" });
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = `
            INSERT INTO Socio (nombre, apellidos, email, password, telefono, fecha_nacimiento, fecha_alta, socio_rol, tipo_socio, corporacion)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id_socio, nombre, apellidos, email, telefono, fecha_nacimiento, tipo_socio;
        `;
        const values = [nombre, apellidos, email, hashedPassword, telefono, fecha_nacimiento, new Date(), 8, 3, req.usuario.id];
        const result = await pool.query(query, values);
        res.status(201).json({ miembro: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al añadir miembro" });
    }
};

const deleteCorporacionMiembro = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.usuario.tipo !== 6) return res.status(403).json({ message: "No autorizado" });
        const checkQuery = `SELECT id_socio FROM Socio WHERE id_socio = $1 AND corporacion = $2;`;
        const check = await pool.query(checkQuery, [id, req.usuario.id]);
        if (check.rows.length === 0) return res.status(404).json({ message: "Miembro no encontrado" });

        await pool.query('DELETE FROM Socio WHERE id_socio = $1;', [id]);
        res.status(200).json({ message: "Miembro eliminado correctamente" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al eliminar miembro" });
    }
};

module.exports = {
    renovarSuscripcion,
    getPerfil,
    updatePerfil,
    deletePerfil,
    getSocios,
    createSocioByAdmin,
    getCorporacionMiembros,
    addCorporacionMiembro,
    deleteCorporacionMiembro
};
