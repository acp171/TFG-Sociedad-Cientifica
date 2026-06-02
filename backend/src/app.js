const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Settings
app.set('port', process.env.PORT || 4000);

// Middlewares
app.use(cors({
  origin: 'https://scdi.vercel.app',
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

// Lógica de arranque del servidor: solo se ejecuta cuando se lanza directamente (no en tests)
if (require.main === module) {
  const fs = require('fs');
  const pool = require('./database');
  const sqlPathCreate = path.join(__dirname, './database/db.sql');
  const sqlPathDrop = path.join(__dirname, './database/dropDatabase.sql');
  const sqlCreate = fs.readFileSync(sqlPathCreate, 'utf8');
  const sqlDrop = fs.readFileSync(sqlPathDrop, 'utf8');

  const runAutomigration = async () => {
    try {
      console.log("Comprobando integridad de slugs...");
      await pool.query(`ALTER TABLE Evento ADD COLUMN IF NOT EXISTS slug VARCHAR(256) UNIQUE;`);
      await pool.query(`ALTER TABLE Publicaciones ADD COLUMN IF NOT EXISTS slug VARCHAR(256) UNIQUE;`);
      await pool.query(`ALTER TABLE Proyectos_Investigacion ADD COLUMN IF NOT EXISTS slug VARCHAR(256) UNIQUE;`);

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

  if (process.env.NODE_ENV === 'development') {
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
      });
  }

  runAutomigration();

  app.listen(app.get('port'), () => {
    console.log('Servidor backend corriendo en http://localhost:' + app.get('port'));
  });
}

module.exports = app;