const { Router } = require ('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Inicializations
const router = Router();
const pool = require('../database');
const saltRounds = 10;
const SECRET_KEY = process.env.JWT_SECRET


// Middlewares
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
  
    if (!token) {
        return res.status(401).json({ message: 'Token requerido' });
    }

    jwt.verify(token, SECRET_KEY, (err, usuario) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
      }

      req.usuario = usuario; // Info extraída del token
      next();
    });
  }


// ROUTES

// POST login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    try {
        const query = 'SELECT * FROM SOCIO WHERE email = $1;';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const socio = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, socio.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            {
              id: socio.id_socio,
              email: socio.email,
              nombre: socio.nombre
            },
            SECRET_KEY,
            { expiresIn: '1h' } // Token expira en 1 hora
          );

        res.status(200).json({
            message: 'Login exitoso.',
            socio: {
                id: socio.id_socio,
                nombre: socio.nombre,
                email: socio.email
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// POST register
router.post('/register', async (req, res) => {
    const { nombre, apellidos, email, password, telefono, fecha_nacimiento, socio_rol, tipo_socio } = req.body;

    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail) {
        return res.status(400).json({ message: 'Correo electrónico no válido.' });
    }

    // Validar que todos los campos necesarios no estén vacíos
    if (!nombre || !apellidos || !password || !telefono || !fecha_nacimiento || !socio_rol || !tipo_socio) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios y no pueden estar vacíos.' });
    }

    const query = 'INSERT INTO Socio(nombre, apellidos, email, password, telefono,' + 
                  'fecha_nacimiento, fecha_alta, socio_rol, tipo_socio)' +
                  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_socio;';

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const values = [
        nombre,
        apellidos,
        email,
        hashedPassword,
        telefono,
        fecha_nacimiento,
        new Date(), // fecha_alta
        socio_rol,
        tipo_socio
    ];

    try {
        const result = await pool.query(query, values);
        console.log("Socio insertado con ID: ", result.rows[0].id_socio);
        res.status(200).json({
            message: 'Registro exitoso.',
            socio: {
                id: result.rows[0].id_socio,
                nombre: result.rows[0].nombre,
                email: result.rows[0].email
            }
        });
    } catch (error) {
        console.error("Error insertando socio: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });

    }
});

// GET perfil
router.get('/perfil', verificarToken, async (req, res) => {
    try {
        const querySocio = 'SELECT nombre, apellidos, email, telefono, fecha_nacimiento, socio_rol, tipo_socio FROM SOCIO WHERE email = $1;';
        const resultSocio = (await pool.query(querySocio, [req.usuario.email]));
        const socio = resultSocio.rows[0];

        const queryRol = 'SELECT * FROM Socio_Rol WHERE id_socio_rol = $1;';
        const resultRol = await pool.query(queryRol, [socio.socio_rol]);

        const queryTipo = 'SELECT * FROM Tipo_Socio WHERE id_tipo_socio = $1;';
        const resultTipo = await pool.query(queryTipo, [socio.tipo_socio]);

        const rol = resultRol.rows[0];
        const tipo = resultTipo.rows[0];

        res.status(200).json({
            message: 'Acceso a perfil.',
            socio: {
                id: socio.id_socio,
                nombre: socio.nombre,
                apellidos: socio.apellidos,
                email: socio.email,
                telefono: socio.telefono,
                fecha_nacimiento: socio.fecha_nacimiento,
                socio_rol: rol.nombre,
                tipo_socio: tipo.nombre_tipo
            }
        });
    } catch (error) {
        console.error("Error al entrar al perfil: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT editar perfil
router.put('/perfil', verificarToken, async (req, res) => {
    const { nombre, apellidos, telefono } = req.body;
    
    // Validar que todos los campos necesarios no estén vacíos
    if (!nombre || !apellidos || !telefono) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios y no pueden estar vacíos.' });
    }

    const values = [
        nombre,
        apellidos,
        telefono,
        req.usuario.email
    ];

    try {
        const query = 'UPDATE Socio SET nombre = $1, apellidos = $2, telefono = $3 WHERE email = $4;';
        const result = (await pool.query(query, values));

        const querySocio = 'SELECT * FROM SOCIO WHERE email = $1;';
        const resultSocio = (await pool.query(querySocio, [req.usuario.email]));
        const socio = resultSocio.rows[0];

        res.status(200).json({
            message: 'Perfil actualizado.',
            socio: {
                id: socio.id_socio,
                nombre: socio.nombre,
                apellidos: socio.apellidos,
                email: socio.email,
                telefono: socio.telefono,
                fecha_nacimiento: socio.fecha_nacimiento,
                socio_rol: socio.socio_rol,
                tipo_socio: socio.tipo_socio
            }
        });
    } catch (error) {
        console.error("Error al actualizar perfil: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;
