const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initializations
const app = express(express.json());
const pool = require('./database');
const sqlPathCreate = path.join(__dirname, './database/db.sql');
const sqlPathDrop = path.join(__dirname, './database/dropDatabase.sql');
const sqlCreate = fs.readFileSync(sqlPathCreate, 'utf8');
const sqlDrop = fs.readFileSync(sqlPathDrop, 'utf8');


// Settings
app.set('port', process.env.PORT || 4000);


// Middlewares
app.use(cors({
  origin: 'https://scdi.vercel.app',
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());


// API
app.use('/', require('./api/api'));


// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/deleteFile', express.static(path.join(__dirname, 'public', 'deleteFile')));

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


// Start server
app.listen(app.get('port'), () => {
  console.log('Servidor backend corriendo en http://localhost:' + app.get('port'));
});