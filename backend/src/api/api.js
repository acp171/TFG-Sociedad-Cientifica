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
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Funciones privadas
const upload = require('../utils/upload');
const eliminarArchivoPDF = require('../utils/deleteFile');
const { obtenernRol, obtenerSocio } = require('../utils/socioUtils');
const { crearNotificacion, crearNotificacionEvento } = require('../utils/notificaciones');
const { obtenerNombreProyecto, obtenerPresidenteProyecto, obtenerMiembro } = require('../utils/proyectoUtils');
const { obtenerNombreComite, obtenerPresidenteComite, obtenerComiteEvento, obtenerComitePorSocio } = require('../utils/comiteUtils');

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
              nombre: socio.nombre,
              rol: socio.socio_rol
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

        await crearNotificacion(
            result.rows[0].id_socio,
            'Bienvenido a la Sociedad Científica',
            'Gracias por registrarte. Esperamos que disfrutes tu experiencia.');

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
        const resultSocio = await pool.query(querySocio, [req.usuario.email]);
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
        const result = await pool.query(query, values);

        const querySocio = 'SELECT * FROM SOCIO WHERE email = $1;';
        const resultSocio = await pool.query(querySocio, [req.usuario.email]);
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

        const result = await pool.query(query, values);
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
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const values = [
            rol,
            id_socio,
            comite
        ];

        const query = 'UPDATE Miembros_Comite SET rol_comite = $1 WHERE socio = $2 AND comite = $3;';

        const result = await pool.query(query, values);
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
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const values = [
            rol,
            id_socio,
            proyecto
        ];

        const  query = 'UPDATE Socio_Proyecto SET rol_proyecto = $1 WHERE socio = $2 AND proyecto = $3;';

        const result = await pool.query(query, values);
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

        const result = await pool.query(query, values);
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

// POST crear un proyecto de investigación
router.post('/proyectos-investigacion/crear-proyecto-investigacion', verificarToken, async (req, res) =>  {
    const { nombre_proyecto, descripcion, fecha_inicio, fecha_fin } = req.body;    
    
    if (!nombre_proyecto || !descripcion || !fecha_fin) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    const fecha_inicio_date = fecha_inicio ? new Date(fecha_inicio) : new Date();
    const fecha_fin_Date = new Date(fecha_fin);
    
    var estado;
    const fecha_actual = new Date();

    if (fecha_actual > fecha_inicio_date) {
        return res.status(400).json({ message: 'No es posible seleccionar esa fecha de inicio.' });
    }
    else if (fecha_actual < fecha_inicio_date) {
        estado = "Pendiente";
    } 
    else if (fecha_actual >= fecha_inicio_date && fecha_actual <= fecha_fin_Date) {
        estado = "En curso";
    }

    if (fecha_fin_Date > fecha_inicio_date) {
        try {
            const valuesProyecto = [
                nombre_proyecto,
                descripcion,
                fecha_inicio_date,
                fecha_fin_Date,
                estado
            ];

            const queryProyecto = 'INSERT INTO Proyectos_Investigacion(nombre_proyecto, descripcion, fecha_inicio,' +
                        'fecha_fin, estado) VALUES ($1, $2, $3, $4, $5) RETURNING id_proyecto, nombre_proyecto,' +
                        'descripcion, fecha_inicio, fecha_fin, estado;';
            const resultProyecto = await pool.query(queryProyecto, valuesProyecto);

            const valuesMiembro = [
                fecha_actual,
                req.usuario.id,
                resultProyecto.rows[0].id_proyecto,
                2
            ]
            const queryMiembro = `INSERT INTO Socio_Proyecto(fecha_registro, socio, proyecto, rol_proyecto) 
                                  VALUES ($1, $2, $3, $4);`;
            await pool.query(queryMiembro, valuesMiembro);

            res.status(200).json({
                message: 'Proyecto de investigación creado.',
                proyecto: {
                    id_proyecto: resultProyecto.rows[0].id_proyecto,
                    nombre_proyecto: resultProyecto.rows[0].nombre_proyecto,
                    descripcion: resultProyecto.rows[0].descripcion,
                    estado: resultProyecto.rows[0].estado,
                    presidente: req.usuario.nombre + ' es presidente.'
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
router.delete('/proyectos-investigacion/:id', verificarToken, async (req, res) =>  {
    const id_proyecto = req.params.id;
    
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteProyecto = await obtenerPresidenteProyecto(id_proyecto);
        if (presidenteProyecto.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
    }

    try {
        const query = 'DELETE FROM Proyectos_Investigacion WHERE id_proyecto = $1;';
        const result = await pool.query(query, [id_proyecto]);

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
router.get('/listado-proyectos-investigacion', async (req, res) =>  {
    try {
        const query = 'SELECT * FROM Proyectos_Investigacion;';
        const listaProyectos = await pool.query(query);

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

// POST añadir miembro al proyecto de investigación
router.post('/proyectos-investigacion/:id/miembros', verificarToken, async (req, res) =>  {
    const { socio, rol_proyecto } = req.body;
    const proyecto = req.params.id;

    if (!socio || !rol_proyecto) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteProyecto = await obtenerPresidenteProyecto(proyecto);
        if (presidenteProyecto.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
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
        const result = await pool.query(query, values);

        const nombreProyecto = await obtenerNombreProyecto(proyecto);
        await crearNotificacion(
            socio,
            'Has sido añadido a un proyecto',
            `Fuiste añadido al proyecto "${nombreProyecto}". ¡Revisa los detalles en la plataforma!`
        );

        const nuevoMiembro = await obtenerMiembro(proyecto, socio)

        res.status(200).json({
            message: 'Miembro añadido al proyecto de investigación.',
            miembro: nuevoMiembro
        });

    }
    catch (error) {
        console.error("Error al intentar añadir un miembro al proyecto de investigación: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE eliminar rol siendo presidente de un proyecto de investigación
router.delete('/proyectos-investigacion/:id/miembros/:id_socio', verificarToken, async (req, res) =>  {
    const proyecto = req.params.id;    
    const id_socio = req.params.id_socio

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteProyecto = await obtenerPresidenteProyecto(proyecto);
        if (presidenteProyecto.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
    }

    try {
        const values = [
            id_socio,
            proyecto
        ];

        const  query = 'DELETE FROM Socio_Proyecto WHERE socio = $1 AND proyecto = $2;';

        const nombreProyecto = await obtenerNombreProyecto(proyecto);
        await crearNotificacion(
            id_socio,
            'Has sido expulsado del proyecto.',
            `Fuiste expulsado del proyecto de investigación "${nombreProyecto}". ¡Revisa los detalles en la plataforma!`
        );

        await pool.query(query, values);
        res.status(200).json({
            message: 'Miembro expulsado.'
        });

    }
    catch (error) {
        console.error("Error al expulsar miembro siendo presidente de proyecto: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET proyecto con miembros
router.get("/proyectos-investigacion/:id", async (req, res) => {
    const id_proyecto = req.params.id;

    try {
        const queryProyecto = `SELECT id_proyecto, nombre_proyecto, descripcion, fecha_inicio, fecha_fin, estado
                                FROM Proyectos_Investigacion 
                                WHERE id_proyecto = $1;`;
        const resultProyecto = await pool.query(queryProyecto, [id_proyecto]);

        if (resultProyecto.rows.length === 0) {
            return res.status(404).json({ message: "Proyecto no encontrado." });
        }

        const proyecto = resultProyecto.rows[0];

        const queryMiembros = `SELECT sp.fecha_registro, s.id_socio, s.nombre, s.apellidos, sr.nombre as rol
                                FROM Socio_Proyecto sp 
                                JOIN Socio s ON sp.socio = s.id_socio 
                                JOIN Socio_Rol sr ON sp.rol_proyecto = sr.id_socio_rol 
                                WHERE sp.proyecto = $1 
                                ORDER BY sp.fecha_registro;`;
        const resultMiembros = await pool.query(queryMiembros, [id_proyecto]);

        res.status(200).json({
            message: "Proyecto encontrado.",
            proyecto: proyecto,
            miembros: resultMiembros.rows,
        });
    } 
    catch (error) {
        console.error("Error al obtener proyecto: ", error.message);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

// POST crear un evento científico
router.post('/eventos-cientificos/crear-evento-cientifico', verificarToken, async (req, res) =>  {
    const { nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, direccion } = req.body;

    if (!nombre_evento || !fecha_evento_inicio || !fecha_evento_fin || !descripcion_evento || !direccion) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    const id_comite = await obtenerComitePorSocio(req.usuario.id);
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteComite = await obtenerPresidenteComite(id_comite);
        if (presidenteComite.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
    }
    
    if (fecha_evento_fin > fecha_evento_inicio) {
        try {
            const values = [
                nombre_evento,
                fecha_evento_inicio,
                fecha_evento_fin,
                descripcion_evento,
                direccion,
                id_comite
            ];

            const query = 'INSERT INTO Evento(nombre_evento, fecha_evento_inicio, fecha_evento_fin,' +
                          'descripcion_evento, direccion, comite) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_evento,' +
                          'nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento;';
            const result = await pool.query(query, values);

            await crearNotificacionEvento(
                'Nuevo evento publicado',
                `Se ha creado un nuevo evento: ${result.rows[0].nombre_evento}`);

            res.status(200).json({
                message: 'Evento científico creado.',
                proyecto: {
                    id_evento: result.rows[0].id_evento,
                    nombre_evento: result.rows[0].nombre_evento,
                    fecha: fecha_evento_inicio + ' hasta ' + fecha_evento_fin,
                    descripcion_evento: result.rows[0].descripcion_evento,
                }
            });
        }
        catch (error) {
            console.error("Error al intentar crear un evento científico: ", error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
    else {
        res.status(403).json({ message: 'Fecha inválida.'});
    }
});

// PUT editar un evento científico
router.put('/eventos-cientificos/:id', verificarToken, async (req, res) =>  {
    const id_evento = req.params.id;
    const { nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, direccion } = req.body;

    if (!id_evento || !nombre_evento || !fecha_evento_inicio || !fecha_evento_fin || !descripcion_evento || !direccion) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const id_comite = await obtenerComiteEvento(id_evento);
        const presidenteComite = await obtenerPresidenteComite(id_comite);
        if (presidenteComite.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
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
            const result = await pool.query(query, values);

            res.status(200).json({
                message: 'Evento científico editado.',
                proyecto: {
                    id_evento: result.rows[0].id_evento,
                    nombre_evento: result.rows[0].nombre_evento,
                    fecha: fecha_evento_inicio + ' hasta ' + fecha_evento_fin,
                    descripcion_evento: result.rows[0].descripcion_evento,
                }
            });
        }
        catch (error) {
            console.error("Error al intentar editar un evento científico: ", error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
    else {
        res.status(403).json({ message: 'Fecha inválida.'});
    }
});

// DELETE eliminar un evento científico
router.delete('/eventos-cientificos/:id', verificarToken, async (req, res) =>  {
    const id_evento = req.params.id;

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const id_comite = await obtenerComiteEvento(id_evento);
        const presidenteComite = await obtenerPresidenteComite(id_comite);
        if (presidenteComite.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
    }
    
    try {
        const query = 'DELETE FROM Evento WHERE id_evento = $1;';
        const result = await pool.query(query, [id_evento]);

        res.status(200).json({
            message: 'Evento científico eliminado.',
        });
    }
    catch (error) {
        console.error("Error al intentar eliminar un evento científico: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET listado de eventos científicos
router.get('/listado-eventos-cientificos', async (req, res) =>  {
    try {
        const query = 'SELECT * FROM Evento;';
        const listaEventos = await pool.query(query);

        res.status(200).json({
            message: 'Lista de eventos científicos.',
            eventos: {
                listaEventos: listaEventos.rows
            }
        });
    }
    catch (error) {
        console.error("Error al intentar listar los eventos científicos: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET detalles del evento científico
router.get('/eventos-cientificos/:id', async (req, res) =>  {
    const id_evento = req.params.id;

    try {
        const queryEvento = `SELECT * 
                       FROM Evento
                       WHERE id_evento = $1;`;
        const resultEvento = await pool.query(queryEvento, [id_evento]);

        if (resultEvento.rows.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado.' });
        }

        const evento = resultEvento.rows[0];
        let miembrosComite = [];

        if (evento.comite) {
            const queryMiembros = `
                SELECT 
                    s.nombre,
                    s.apellidos,
                    sr.nombre AS rol
                FROM Miembros_Comite mc
                JOIN Socio s ON mc.socio = s.id_socio
                JOIN Socio_Rol sr ON mc.rol_comite = sr.id_socio_rol
                WHERE mc.comite = $1;
            `;
            const resultMiembros = await pool.query(queryMiembros, [evento.comite]);
            miembrosComite = resultMiembros.rows;
        }

        res.status(200).json({
            message: 'Detalles del evento científico.',
            eventos: evento,
            miembrosComite: miembrosComite
        });
    }
    catch (error) {
        console.error("Error al intentar obtener detalles del evento científico: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST publicar articulo científico
router.post('/articulos-cientificos/publicar-articulo-cientifico', verificarToken, upload.single('pdf'), async (req, res) => {
    const { titulo, contenido } = req.body;
    var rutaPDF;

    if (!titulo || (!req.file && !contenido)) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }
    else if (req.file) {
        rutaPDF = `/uploads/pdfs/${req.file.filename}`;
    }

    try {
        var query, values;

        if (req.file && !contenido) {
            values = [
                titulo,
                rutaPDF,
                new Date(),
                req.usuario.id
            ];
    
            query = 'INSERT INTO Publicaciones(titulo, contenidoPDF, fecha_publicacion, socio)' +
                          'VALUES($1, $2, $3, $4) RETURNING id_publicacion, titulo, socio;';
        }
        else if (!req.file && contenido) {
            values = [
                titulo,
                contenido,
                new Date(),
                req.usuario.id
            ];
    
            query = 'INSERT INTO Publicaciones(titulo, contenido, fecha_publicacion, socio)' +
                          'VALUES($1, $2, $3, $4) RETURNING id_publicacion, titulo, socio;';
        }
        else {
            values = [
                titulo,
                contenido,
                rutaPDF,
                new Date(),
                req.usuario.id
            ];
    
            query = 'INSERT INTO Publicaciones(titulo, contenido, contenidoPDF, fecha_publicacion, socio)' +
                          'VALUES($1, $2, $3, $4, $5) RETURNING id_publicacion, titulo, socio;';
        }
        
        const result = await pool.query(query, values);
        res.status(200).json({
            message: 'Artículo científico publicado.',
            publicacion: {
                id_publicacion: result.rows[0].id_publicacion,
                titulo: result.rows[0].titulo,
                socio: result.rows[0].socio
            }
        });

    } catch (error) {
        console.error("Error al intentar publicar un artículo científico: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE eliminar artículo científico
router.delete('/articulos-cientificos/:id', verificarToken, async (req, res) => {
    const id_publicacion = req.params.id;

    try {
        const querySelect = 'SELECT contenidoPDF, socio FROM Publicaciones WHERE id_publicacion = $1';
        const result = await pool.query(querySelect, [id_publicacion]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Publicación no encontrada.' });
        }

        const publicacion = result.rows[0];

        const adminRol = obtenernRol(req.usuario);
        const esAutor = publicacion.socio === req.usuario.id;

        if (!adminRol || adminRol.nombre !== 'Administrador') {
            if (!esAutor) {
                return res.status(403).json({ message: 'No autorizado. Se requieren permisos.' });
            }
        }

        // Elimina el archivo si existe
        if (publicacion.contenidopdf) {
            console.log('Ejecutando eliminación de PDF...');
            eliminarArchivoPDF(publicacion.contenidopdf);
        }

        const queryDelete = 'DELETE FROM Publicaciones WHERE id_publicacion = $1;';
        await pool.query(queryDelete, [id_publicacion]);

        res.status(200).json({
            message: 'Artículo científico eliminado.',
        });

    } catch (error) {
        console.error("Error al intentar eliminar la publicación: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET listado artículos científico
router.get('/listado-articulos-cientificos', async (req, res) => {
    try {
        const query = `SELECT p.id_publicacion, p.titulo, p.contenido, p.contenidopdf,
                              p.fecha_publicacion, s.id_socio, s.nombre, s.apellidos
                        FROM Publicaciones p
                        JOIN Socio s ON p.socio = s.id_socio
                        ORDER BY p.fecha_publicacion DESC;`;
        const listadoArticulos = await pool.query(query);

        res.status(200).json({
            message: 'Listado de artículos científicos.',
            articulos: {
                listadoArticulos: listadoArticulos.rows
            }
        });
    } catch (error) {
        console.error("Error al intentar listar publicaciones: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET artículo científico
router.get('/articulos-cientificos/:id', async (req, res) => {
    const id_publicacion = req.params.id;

    try {
        const query = `SELECT p.id_publicacion, p.titulo, p.contenido, p.contenidopdf,
                              p.fecha_publicacion, s.id_socio, s.nombre, s.apellidos
                        FROM Publicaciones p
                        JOIN Socio s ON p.socio = s.id_socio
                        WHERE p.id_publicacion = $1;;`;
        const resultArticulo = await pool.query(query, [id_publicacion]);

        if (resultArticulo.rows.length === 0) {
            return res.status(404).json({ message: 'Artículo científico no encontrado.' });
        }

        const articulo = resultArticulo.rows[0];

        // Obtener comentarios del artículo
        const queryComentarios = `SELECT c.id_comentario, c.comentario, c.fecha_comentario, 
                                         c.visibilidad, s.nombre, s.apellidos 
                                  FROM Comentario_Publicacion c 
                                  JOIN Socio s ON c.socio = s.id_socio 
                                  WHERE c.publicacion = $1 
                                  ORDER BY c.fecha_comentario DESC;`;
        const resultComentarios = await pool.query(queryComentarios, [id_publicacion]);

        res.status(200).json({
            message: 'Artículo científico encontrado.',
            articulo: articulo,
            comentarios: resultComentarios.rows
        });
    } catch (error) {
        console.error("Error al intentar buscar publicación: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET PDF del artículo científico
router.get('/articulos-cientificos/:id/pdf', async (req, res) => {
    const id_publicacion = req.params.id;

    try {
        const query = `SELECT contenidopdf FROM Publicaciones WHERE id_publicacion = $1`;
        const result = await pool.query(query, [id_publicacion]);

        if (result.rows.length === 0 || !result.rows[0].contenidopdf) {
            return res.status(404).json({ message: "PDF no encontrado" });
        }

        let pdfRelativePath = result.rows[0].contenidopdf;

        // Eliminar "/" inicial si existe
        if (pdfRelativePath.startsWith('/')) {
            pdfRelativePath = pdfRelativePath.slice(1);
        }

        const pdfAbsolutePath = path.resolve(__dirname, '..', 'public', pdfRelativePath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="articulo_${id_publicacion}.pdf"`);

        res.sendFile(pdfAbsolutePath, (err) => {
            if (err) {
                console.error("Error al enviar PDF:", err);
                if (!res.headersSent) {
                    res.status(500).send("Error al descargar el PDF");
                }
            }
        });
    } catch (error) {
        console.error("Error al buscar PDF:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST hacer un comentario en articulo científico
router.post('/articulos-cientificos/:id/comentarios', verificarToken, async (req, res) => {
    const publicacion = req.params.id;
    const { comentario } = req.body;

    if (!comentario) {
        res.status(400).json({ message: 'Falta el comentario.' });
    }

    try {
        values = [
            comentario,
            req.usuario.id,
            publicacion,
            new Date(),
            true
        ];

        const query = 'INSERT INTO Comentario_Publicacion(comentario, socio, publicacion, fecha_comentario, visibilidad)' +
                      'VALUES($1, $2, $3, $4, $5) RETURNING id_comentario, socio, publicacion, comentario;';
        const result = await pool.query(query, values);

        const queryComentario = `SELECT c.id_comentario, c.comentario, c.fecha_comentario, 
                                         c.visibilidad, s.nombre, s.apellidos 
                                  FROM Comentario_Publicacion c 
                                  JOIN Socio s ON c.socio = s.id_socio 
                                  WHERE c.publicacion = $1 AND c.id_comentario = $2
                                  ORDER BY c.fecha_comentario DESC;`;
        const resultComentario = await pool.query(queryComentario, [publicacion, result.rows[0].id_comentario]);

        res.status(200).json({
            message: 'Comentario en artículo científico publicado.',
            comentario: {
                id_comentario: resultComentario.rows[0].id_comentario,
                nombre: resultComentario.rows[0].nombre,
                apellidos: resultComentario.rows[0].apellidos,
                comentario: resultComentario.rows[0].comentario,
                fecha_comentario: resultComentario.rows[0].fecha_comentario
            }
        });

    } catch (error) {
        console.error("Error al intentar publicar un comenatario en artículo científico: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PATCH moderar comentario
router.patch('/articulos-cientificos/:id/comentarios/:id_comentario/moderar', verificarToken, async (req, res) => {
    const id_comentario = req.params.id_comentario;

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const query = `UPDATE Comentario_Publicacion 
                       SET visibilidad = NOT visibilidad 
                       WHERE id_comentario = $1
                       RETURNING *;`;
        const result = await pool.query(query, [id_comentario]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Comentario no encontrado." });
        }

        res.status(200).json({
            message: 'Comentario moderado en artículo científico.',
            comentario: result.rows[0]
        });

    } catch (error) {
        console.error("Error al intentar moderar un comenatario en artículo científico: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST crear comité científico
router.post('/crear-comite-cientifico', verificarToken, async (req, res) => {
    const { nombre_comite, descripcion, socio } = req.body;

    if (!nombre_comite || !descripcion || !socio) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }

    try {
        const valuesComite = [
            nombre_comite,
            descripcion,
            new Date()
        ];
        const queryComite = `INSERT INTO Comite(nombre_comite, descripcion, fecha_creacion) 
                       VALUES ($1, $2, $3)
                       RETURNING id_comite, nombre_comite, descripcion;`;
        const resultComite = await pool.query(queryComite, valuesComite);

        const valuesAsignarPresidente = [
            new Date(),
            socio,
            resultComite.rows[0].id_comite,
            "2"
        ];
        const queryAsignarPresidente = `INSERT INTO Miembros_Comite(fecha_registro, socio, comite, rol_comite)
                                        VALUES ($1, $2, $3, $4)
                                        RETURNING socio;`;
        const resultAsignarPresidente = await pool.query(queryAsignarPresidente, valuesAsignarPresidente);

        const socioPresidente = await obtenerSocio(socio);

        res.status(200).json({
            message: 'Comité científico creado.',
            comite: {
                id_comite: resultComite.rows[0].id_comite,
                nombre_comite: resultComite.rows[0].nombre_comite,
                presidente: socioPresidente.nombre + ' ' + socioPresidente.apellidos + ' es el Presidente.'
            }
        });

    } catch (error) {
        console.error("Error al intentar crear un comité científico: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST añadir miembros al comité científico
router.post('/add-miembro-comite-cientifico', verificarToken, async (req, res) => {
    const { socio, comite, rol_comite } = req.body;

    if (!socio || !comite || !rol_comite) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        const presidenteComite = await obtenerPresidenteComite(comite);
        if (presidenteComite.socio !== req.usuario.id) {
            return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
        }
    }

    try {
        const valuesAsignarPresidente = [
            new Date(),
            socio,
            comite,
            rol_comite
        ];
        const queryNuevoMiembro = `INSERT INTO Miembros_Comite(fecha_registro, socio, comite, rol_comite)
                                   VALUES ($1, $2, $3, $4)
                                   RETURNING socio, comite, rol_comite;`;
        const resultNuevoMiembro = await pool.query(queryNuevoMiembro, valuesAsignarPresidente);

        const nombreComite = await obtenerNombreComite(comite);
        await crearNotificacion(
            socio,
            'Has sido añadido a un comité científico',
            `Fuiste añadido al comité científico "${nombreComite}". ¡Revisa los detalles en la plataforma!`
        );

        res.status(200).json({
            message: 'Miembro añadido al comité científico.',
            comite: {
                comite: resultNuevoMiembro.rows[0].comite,
                socio: resultNuevoMiembro.rows[0].socio,
                rol_comite: resultNuevoMiembro.rows[0].rol_comite
            }
        });

    } catch (error) {
        console.error("Error al intentar añadir un miembro al comité científico: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE eliminar miembro del comité siendo presidente de comité
router.delete('/eliminar-miembro-comite', verificarToken, async (req, res) =>  {
    const { socio, comite } = req.body;    

    const presidenteComite = await obtenerPresidenteComite(comite);
    if (!presidenteComite || presidenteComite.socio !== req.usuario.id) {
        return res.status(403).json({ message: 'No autorizado. Se requieren permisos.' });
    }

    try {
        const values = [
            socio,
            comite
        ];

        const query = 'DELETE FROM Miembros_Comite WHERE socio = $1 AND comite = $2;';
        const result = await pool.query(query, values);

        const nombreComite = await obtenerNombreComite(comite);
        await crearNotificacion(
            socio,
            'Has sido expulsado de un comité científico',
            `Fuiste expulsado del comité científico "${nombreComite}". ¡Revisa los detalles en la plataforma!`
        );

        res.status(200).json({
            message: 'Miembro expulsado del comité científico.'
        });

    }
    catch (error) {
        console.error("Error al expulsado miembro siendo presidente de comité: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET listado de comités científicos y sus miembros
router.get('/listado-comites-cientificos', verificarToken, async (req, res) =>  {
    try {
        const query = `SELECT C.id_comite, C.nombre_comite, C.descripcion, S.id_socio,
                       S.nombre AS nombre_socio, S.apellidos, SR.nombre AS rol
                       FROM Comite C
                       JOIN Miembros_Comite MC ON C.id_comite = MC.comite
                       JOIN Socio S ON MC.socio = S.id_socio
                       JOIN Socio_Rol SR ON MC.rol_comite = SR.id_socio_rol
                       ORDER BY C.id_comite;`;
        const result = await pool.query(query);

        // Reorganizar los datos en estructura por comité
        const comites = {};

        result.rows.forEach(row => {
            if (!comites[row.id_comite]) {
                comites[row.id_comite] = {
                id_comite: row.id_comite,
                nombre_comite: row.nombre_comite,
                descripcion: row.descripcion,
                miembros: []
                };
            }

            comites[row.id_comite].miembros.push({
                id_socio: row.id_socio,
                nombre_socio: row.nombre_socio + ' ' + row.apellidos,
                rol: row.rol,
            });
        });

        res.status(200).json({
            message: 'Listado de cómites científicos.',
            listadoComites: Object.values(comites)
        });
    }
    catch (error) {
        console.error("Error al listar comités científico: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST enviar notificacion usuario siendo administrador
router.post('/notificacion-usuario', verificarToken, async (req, res) => {
    const { id_socio, titulo, notificacion } = req.body;

    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
    }

    if (!titulo || !notificacion) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    try {
        await crearNotificacion(
            id_socio,
            titulo,
            notificacion
        );

        res.status(200).json({
            message: 'Notificación enviada al socio.'
        });
    }
    catch (error) {
        console.error("Error al enviar notificación al socio: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET listado notificaciones por usuario
router.get('/listado-notificacion-usuario', verificarToken, async (req, res) => {
    try {
        const queryNotificacionesUsuario = `SELECT * FROM Notificaciones 
                                            WHERE socio = $1 AND leida = FALSE 
                                            ORDER BY fecha DESC;`;
        const resultNotificionesUsuario = await pool.query(queryNotificacionesUsuario, [req.usuario.id])

        res.status(200).json({
            message: 'Listado de notificaciones del usuario.',
            notificaciones: {
                listadoNotificaciones: resultNotificionesUsuario.rows
            }
        });
    }
    catch (error) {
        console.error("Error al listar notificaciones por usuario: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET listado notificaciones de todos los usuario
router.get('/listado-notificaciones', verificarToken, async (req, res) => {
    const adminRol = await obtenernRol(req.usuario);
    if (!adminRol || adminRol.nombre !== 'Administrador') {
        return res.status(403).json({ message: 'No autorizado. Se requiere permisos.' });
    }

    try {
        const queryNotificaciones = `SELECT * 
                                     FROM Notificaciones;`;
        const resultNotificiones = await pool.query(queryNotificaciones, [req.usuario.id])

        res.status(200).json({
            message: 'Listado de notificaciones.',
            notificaciones: {
                listadoNotificaciones: resultNotificiones.rows
            }
        });
    }
    catch (error) {
        console.error("Error al listar notificaciones: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT marcar una notificación como leída
router.put('/notificaciones/:id/leida', async (req, res) => {
    const idNotificacion = req.params.id;
  
    try {
        const query = `UPDATE Notificaciones SET estado_lectura = TRUE WHERE id_notificacion = $1`;
        await pool.query(query, [idNotificacion]);
    
        res.status(200).json({ message: 'Notificación marcada como leída.' });
    }
    catch (error) {
        console.error("Error al marcar notificacion por usuario: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

router.post('/pagar-suscripcion', async (req, res) => {
    const { tipo_socio } = req.body; // viene del frontend, según el plan que elija

    try {
        const queryPriceStripe = `SELECT price_stripe 
                    FROM Tipo_Socio 
                    WHERE nombre_tipo = $1;`;
        const resultPriceStripe = await pool.query(queryPriceStripe, [tipo_socio]);
        

        if (resultPriceStripe.rows.length === 0) {
            return res.status(403).json({ message: 'La suscripción solicitada no existe o no está disponible en estos momentos.' });
        }

        const price_stripe = resultPriceStripe.rows[0].price_stripe;
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: price_stripe,
                quantity: 1,
            }],
            success_url: 'https://scdi.vercel.app/perfil/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://scdi.vercel.app/register',
        });

        res.status(200).json({ id: session.id });
    }
    catch (error) {
        console.error("Error al pagar suscripcion: ", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }  
});

module.exports = router;