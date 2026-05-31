const jwt = require('jsonwebtoken');
const pool = require('../database');
const SECRET_KEY = process.env.JWT_SECRET;

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token requerido' });
    }

    jwt.verify(token, SECRET_KEY, (err, usuario) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }

        req.usuario = usuario;
        next();
    });
}

async function verificarSuscripcionActiva(req, res, next) {
    verificarToken(req, res, async () => {
        try {
            const query = 'SELECT fecha_expiracion FROM Socio WHERE id_socio = $1;';
            const result = await pool.query(query, [req.usuario.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Socio no encontrado' });
            }

            const { fecha_expiracion } = result.rows[0];
            if (!fecha_expiracion || new Date() > new Date(fecha_expiracion)) {
                return res.status(403).json({
                    message: 'Suscripción mensual caducada',
                    requiereRenovacion: true
                });
            }
            next();
        } catch (err) {
            console.error('Error al verificar suscripción:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    });
}

module.exports = {
    verificarToken,
    verificarSuscripcionActiva
};
