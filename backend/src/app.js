const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initializations
const app = express();
const pool = require('./database');
const sqlPath = path.join(__dirname, './database/db.sql');
//const sqlPath = path.join(__dirname, './database/dropDatabase.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');


// Settings
app.set('port', process.env.PORT || 4000);


// Middlewares
app.use(cors());
app.use(express.json());


// API
app.use('/', require('./api/api'));


// Static files
app.use(express.static(path.join(__dirname, 'public')));


pool.query(sql)
  .then(() => {
    console.log('Tablas creadas correctamente.');
  })
  .catch((err) => {
    console.error('Error al crear las tablas:', err);
  });



//Borrar base de datos
/*pool.query(sql)
  .then(() => {
    console.log('Tablas eliminadas correctamente.');
  })
  .catch((err) => {
    console.error('Error al eliminar las tablas:', err);
  })
  .finally(() => {
    pool.end();
  });*/


// Start server
app.listen(app.get('port'), () => {
  console.log('Servidor backend corriendo en http://localhost:' + app.get('port'));
});