const express = require('express');
const cors = require('cors');
const path = require('path');

// Inicializations
const app = express();

// Settings
app.set('port', process.env.PORT || 4000);

// Middlewares
app.use(cors());
app.use(express.json());


// API
app.use('/', require('./api/api'))


// Routes
app.use(express.static(path.join(__dirname, 'public')));


// Starting server
app.listen(app.get('port'), () => {
    console.log('Servidor backend corriendo en http://localhost:' + app.get('port'));
});