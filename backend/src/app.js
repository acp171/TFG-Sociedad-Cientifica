const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initializations
const pool = require('./database');
const sqlPathCreate = path.join(__dirname, './database/db.sql');
const sqlPathDrop = path.join(__dirname, './database/dropDatabase.sql');
const sqlCreate = fs.readFileSync(sqlPathCreate, 'utf8');
const sqlDrop = fs.readFileSync(sqlPathDrop, 'utf8');


// Settings
app.set('port', process.env.PORT || 4000);


// Middlewares
app.use(cors({
  //origin: 'https://scdi.vercel.app',
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// API
app.use('/webhook', require('./routes/webhookRoutes'));
app.use(express.json());
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/socioRoutes'));
app.use('/', require('./routes/eventoRoutes'));
app.use('/', require('./routes/proyectoRoutes'));
app.use('/', require('./routes/articuloRoutes'));
app.use('/', require('./routes/notificacionRoutes'));
app.use('/', require('./routes/comiteRoutes'));
app.use('/', require('./routes/adminRoutes'));


// Static files
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  // Borrar tablas base de datos development
  pool.query(sqlDrop)
  .then(() => {
      console.log('Tablas eliminadas correctamente.');
      return pool.query(sqlCreate);
  })
  .then(() => {
    console.log('Tablas creadas correctamente.');
  })
  .catch((err) => {
    console.error('Error al crear las tablas:', err);
  })
}


// Automigración de slugs
const runAutomigration = async () => {
  try {
    console.log("Comprobando integridad de slugs...");
    // 1. Asegurar que las columnas existen
    await pool.query(`ALTER TABLE Evento ADD COLUMN IF NOT EXISTS slug VARCHAR(256) UNIQUE;`);
    await pool.query(`ALTER TABLE Publicaciones ADD COLUMN IF NOT EXISTS slug VARCHAR(256) UNIQUE;`);
    await pool.query(`ALTER TABLE Proyectos_Investigacion ADD COLUMN IF NOT EXISTS slug VARCHAR(256) UNIQUE;`);

    // 2. Función auxiliar de postgres para slugify (solo si no existe)
    // Usamos COALESCE y regex para generar slugs básicos para registros existentes que no tengan uno.
    const tables = [
      { name: 'Evento', id: 'id_evento', title: 'nombre_evento' },
      { name: 'Publicaciones', id: 'id_publicacion', title: 'titulo' },
      { name: 'Proyectos_Investigacion', id: 'id_proyecto', title: 'nombre_proyecto' }
    ];

    for (const table of tables) {
      await pool.query(`
        UPDATE ${table.name} 
        SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(NORMALIZE(${table.title}, NFD), '[^a-zA-Z0-9 ]', '', 'g'), '\\s+', '-', 'g'))
        WHERE slug IS NULL;
      `);
    }
    console.log("Slugs verificados correctamente.");
  } catch (err) {
    console.error("Error en automigración:", err);
  }
};

runAutomigration();

// Start server
app.listen(app.get('port'), () => {
  console.log('Servidor backend corriendo en http://localhost:' + app.get('port'));
});