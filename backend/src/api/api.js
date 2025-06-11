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


// Funciones privadas
async function obtenernRol(usuario) {
    const querySocio = 'SELECT socio_rol FROM SOCIO WHERE email = $1;';
    const resultSocio = (await pool.query(querySocio, [usuario.email]));
    const socio = resultSocio.rows[0];

    const querySocioRol = 'SELECT nombre FROM Socio_Rol WHERE id_socio_rol = $1;';
    const resultSocioRol = (await pool.query(querySocioRol, [socio.socio_rol]));
    const socioRol = resultSocioRol.rows[0];

    return socioRol;
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
                  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_socio, nombre, email;';

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

// PUT asignar rol siendo administrador general
router.put('/asignar-rol', verificarToken, async (req, res) =>  {
    const { id_socio, rol, proyecto, comite, funcion } = req.body;    

    const adminRol = await obtenernRol(req.usuario);
    // Verifica si el usuario es administrador
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        var query, values;
        switch(funcion) {
            case 'socio':
                values = [
                    rol,
                    id_socio
                ];

                query = 'UPDATE Socio SET socio_rol = $1 WHERE id_socio = $2;';
            break;

            case 'comite':
                values = [
                    rol,
                    id_socio,
                    comite
                ];

                query = 'UPDATE Miembros_Comite SET rol_comite = $1 WHERE socio = $2 AND comite = $3;';

            break;

            case 'proyecto':
                values = [
                    rol,
                    id_socio,
                    proyecto
                ];

                query = 'UPDATE Socio_Proyecto SET rol_proyecto = $1 WHERE socio = $2 AND proyecto = $3;';

            break;
        }

        const result = (await pool.query(query, values));
        res.status(200).json({
            message: 'Rol asignado.',
            socio: {
                id: id_socio,
                rol: rol
            }
        });

    }
    catch (error) {
        console.error("Error al asignar rol siendo administrador: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT asignar rol siendo presidente de comite
router.put('/asignar-rol-comite', verificarToken, async (req, res) =>  {
    const { id_socio, rol, comite } = req.body;    

    const presidenteRol = await obtenernRol(req.usuario);
    if (!presidenteRol || presidenteRol.nombre !== 'Presidente') {
        console.log(req.usuario);
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const values = [
            rol,
            id_socio,
            comite
        ];

        const query = 'UPDATE Miembros_Comite SET rol_comite = $1 WHERE socio = $2 AND comite = $3;';

        const result = (await pool.query(query, values));
        res.status(200).json({
            message: 'Rol asignado.',
            socio: {
                id: id_socio,
                rol: rol
            }
        });

    }
    catch (error) {
        console.error("Error al asignar rol siendo presidente de comité: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// PUT asignar rol siendo presidente de comite
router.put('/asignar-rol-proyecto', verificarToken, async (req, res) =>  {
    const { id_socio, rol, proyecto } = req.body;    

    const presidenteRol = await obtenernRol(req.usuario);
    if (!presidenteRol || presidenteRol.nombre !== 'Presidente') {
        console.log(req.usuario);
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const values = [
            rol,
            id_socio,
            proyecto
        ];

        const  query = 'UPDATE Socio_Proyecto SET rol_proyecto = $1 WHERE socio = $2 AND proyecto = $3;';

        const result = (await pool.query(query, values));
        res.status(200).json({
            message: 'Rol asignado.',
            socio: {
                id: id_socio,
                rol: rol
            }
        });

    }
    catch (error) {
        console.error("Error al asignar rol siendo presidente de proyecto: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE eliminar rol siendo administrador general
router.delete('/eliminar-rol', verificarToken, async (req, res) =>  {
    const { id_socio, proyecto, comite, funcion } = req.body;    

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        var query, values;
        switch(funcion) {
            case 'socio':
                values = [
                    id_socio
                ];

                query = 'DELETE FROM Socio WHERE id_socio = $1;';
            break;

            case 'comite':
                values = [
                    id_socio,
                    comite
                ];

                query = 'DELETE FROM Miembros_Comite WHERE socio = $1 AND comite = $2;';

            break;

            case 'proyecto':
                values = [
                    id_socio,
                    proyecto
                ];

                query = 'DELETE FROM Socio_Proyecto SET rol_proyecto = $1 WHERE socio = $1 AND proyecto = $2;';

            break;
        }

        const result = (await pool.query(query, values));
        res.status(200).json({
            message: 'Rol asignado.',
            socio: {
                id: id_socio,
                rol: rol
            }
        });

    }
    catch (error) {
        console.error("Error al eliminar rol siendo administrador: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE eliminar rol del comité siendo presidente de comité
router.delete('/eliminar-rol-comite', verificarToken, async (req, res) =>  {
    const { id_socio, comite } = req.body;    

    const presidenteRol = await obtenernRol(req.usuario);
    if (!presidenteRol || presidenteRol.nombre !== 'Presidente') {
        console.log(req.usuario);
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const values = [
            id_socio,
            comite
        ];

        const query = 'DELETE FROM Miembros_Comite WHERE socio = $1 AND comite = $2;';

        const result = (await pool.query(query, values));
        res.status(200).json({
            message: 'Rol eliminardo.'
        });

    }
    catch (error) {
        console.error("Error al eliminar rol siendo presidente de comité: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE eliminar rol siendo presidente de un proyecto de investigación
router.delete('/eliminar-rol-proyecto', verificarToken, async (req, res) =>  {
    const { id_socio, proyecto } = req.body;    

    const presidenteRol = await obtenernRol(req.usuario);
    if (!presidenteRol || presidenteRol.nombre !== 'Presidente') {
        console.log(req.usuario);
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const values = [
            id_socio,
            proyecto
        ];

        const  query = 'DELETE FROM Socio_Proyecto WHERE socio = $1 AND proyecto = $2;';

        const result = (await pool.query(query, values));
        res.status(200).json({
            message: 'Rol eliminardo.'
        });

    }
    catch (error) {
        console.error("Error al eliminar rol siendo presidente de proyecto: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST crear un proyecto de investigación
router.post('/crear-proyecto-investigacion', verificarToken, async (req, res) =>  {
    const { nombre_proyecto, descripcion, fecha_fin, estado } = req.body;    
    const fecha_inicio = new Date();
    const fecha_fin_Date = new Date(fecha_fin);

    if (fecha_fin_Date > fecha_inicio) {
        try {
            const values = [
                nombre_proyecto,
                descripcion,
                fecha_inicio,
                fecha_fin_Date,
                estado
            ];

            const query = 'INSERT INTO Proyectos_Investigacion(nombre_proyecto, descripcion, fecha_inicio,' +
                        'fecha_fin, estado) VALUES ($1, $2, $3, $4, $5) RETURNING id_proyecto, nombre_proyecto,' +
                        'descripcion, fecha_inicio, fecha_fin, estado;';
            const result = (await pool.query(query, values));

            const rol = obtenernRol(req.usuario);
            if (!rol || rol.nombre !== "Administrador") {
                const queryAsignarPresidente = "UPDATE Socio SET socio_rol = 2 WHERE email = $1;";
                const resultAsignarPresidente = (await pool.query(queryAsignarPresidente, [req.usuario.email]));
            }

            res.status(200).json({
                message: 'Proyecto de investigación creado.',
                proyecto: {
                    id_proyecto: result.rows[0].id_proyecto,
                    nombre_proyecto: result.rows[0].nombre_proyecto,
                    descripcion: result.rows[0].descripcion,
                    estado: result.rows[0].estado
                }
            });
        }
        catch (error) {
            console.error("Error al intentar crear un proyecto de investigación: ", error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
    else {
        res.status(403).json({ message: 'Fecha fin inválida.'});
    }
});

// DELETE eliminar un proyecto de investigación
router.delete('/eliminar-proyecto-investigacion', verificarToken, async (req, res) =>  {
    const { id_proyecto } = req.body;
    
    const rol = await obtenernRol(req.usuario);
    if (!rol || (rol.nombre !== 'Presidente' && rol.nombre !== 'Administrador')) {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const query = 'DELETE FROM Proyectos_Investigacion WHERE id_proyecto = $1;';
        const result = (await pool.query(query, [id_proyecto]));

        res.status(200).json({
            message: 'Proyecto de investigación eliminado.'
        });

    }
    catch (error) {
        console.error("Error al intentar eliminar un proyecto de investigación: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET ver proyectos de investigación
router.get('/listado-proyectos-investigacion', verificarToken, async (req, res) =>  {
    try {
        const query = 'SELECT * FROM Proyectos_Investigacion;';
        const listaProyectos = (await pool.query(query));

        res.status(200).json({
            message: 'Lista de proyectos de investigación.',
            proyectos: {
                listaProyectos: listaProyectos.rows
            }
        });

    }
    catch (error) {
        console.error("Error al intentar listar los proyectos de investigación: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST ver proyectos de investigación
router.post('/add-miembro-proyecto-investigacion', verificarToken, async (req, res) =>  {
    const { socio, proyecto, rol_proyecto} = req.body;

    const rol = await obtenernRol(req.usuario);
    if (!rol || (rol.nombre !== 'Presidente' && rol.nombre !== 'Administrador')) {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const values = [
            new Date(),
            socio,
            proyecto,
            rol_proyecto
        ];

        const query = 'INSERT INTO Socio_Proyecto(fecha_registro, socio, proyecto, rol_proyecto)' +
                      'VALUES ($1, $2, $3, $4) RETURNING socio, proyecto, rol_proyecto';
        const result = (await pool.query(query, values));

        res.status(200).json({
            message: 'Miembro añadido al proyecto de investigación.',
            miembro: {
                socio: result.rows[0].socio,
                proyecto: result.rows[0].proyecto,
                rol_proyecto: result.rows[0].rol_proyecto
            }
        });

    }
    catch (error) {
        console.error("Error al intentar añadir un miembro al proyecto de investigación: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST crear un evento cientifíco
router.post('/crear-evento-cientifico', verificarToken, async (req, res) =>  {
    const { nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, direccion } = req.body;

    const rol = await obtenernRol(req.usuario);
    if (!rol || (rol.nombre !== 'Presidente' && rol.nombre !== 'Administrador')) {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }
    
    if (fecha_evento_fin > fecha_evento_inicio) {
        try {
            const values = [
                nombre_evento,
                fecha_evento_inicio,
                fecha_evento_fin,
                descripcion_evento,
                direccion
            ];

            const query = 'INSERT INTO Evento(nombre_evento, fecha_evento_inicio, fecha_evento_fin,' +
                          'descripcion_evento, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING id_evento,' +
                          'nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento;';
            const result = (await pool.query(query, values));

            res.status(200).json({
                message: 'Evento cientifíco creado.',
                proyecto: {
                    id_evento: result.rows[0].id_evento,
                    nombre_evento: result.rows[0].nombre_evento,
                    fecha: fecha_evento_inicio + ' hasta ' + fecha_evento_fin,
                    descripcion_evento: result.rows[0].descripcion_evento,
                }
            });
        }
        catch (error) {
            console.error("Error al intentar crear un evento cientifíco: ", error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
    else {
        res.status(403).json({ message: 'Fecha inválida.'});
    }
});

// PUT editar un evento cientifíco
router.put('/editar-evento-cientifico', verificarToken, async (req, res) =>  {
    const { id_evento, nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, direccion } = req.body;

    const rol = await obtenernRol(req.usuario);
    if (!rol || rol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }
    
    if (fecha_evento_fin > fecha_evento_inicio) {
        try {
            const values = [
                nombre_evento,
                fecha_evento_inicio,
                fecha_evento_fin,
                descripcion_evento,
                direccion,
                id_evento
            ];

            const query = 'UPDATE Evento SET nombre_evento = $1, fecha_evento_inicio = $2, fecha_evento_fin = $3,' +
                          'descripcion_evento = $4, direccion = $5 WHERE id_evento = $6 RETURNING id_evento,' +
                          'nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento;';
            const result = (await pool.query(query, values));

            res.status(200).json({
                message: 'Evento cientifíco editado.',
                proyecto: {
                    id_evento: result.rows[0].id_evento,
                    nombre_evento: result.rows[0].nombre_evento,
                    fecha: fecha_evento_inicio + ' hasta ' + fecha_evento_fin,
                    descripcion_evento: result.rows[0].descripcion_evento,
                }
            });
        }
        catch (error) {
            console.error("Error al intentar editar un evento cientifíco: ", error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
    else {
        res.status(403).json({ message: 'Fecha inválida.'});
    }
});

// DELETE eliminar un evento cientifíco
router.delete('/eliminar-evento-cientifico', verificarToken, async (req, res) =>  {
    const { id_evento } = req.body;

    const rol = await obtenernRol(req.usuario);
    if (!rol || rol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }
    
    try {
        const query = 'DELETE FROM Evento WHERE id_evento = $1;';
        const result = (await pool.query(query, [id_evento]));

        res.status(200).json({
            message: 'Evento cientifíco eliminado.',
        });
    }
    catch (error) {
        console.error("Error al intentar eliminar un evento cientifíco: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET listado de eventos cientifícos
router.get('/listado-eventos-cientificos', verificarToken, async (req, res) =>  {
    try {
        const query = 'SELECT * FROM Evento;';
        const result = (await pool.query(query));

        res.status(200).json({
            message: 'Evento cientifíco eliminado.',
            eventos: {
                listaoEventos: result.rows
            }
        });
    }
    catch (error) {
        console.error("Error al intentar listar los eventos cientifícos: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


module.exports = router;
