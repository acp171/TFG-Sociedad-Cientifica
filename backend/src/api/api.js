const { Router } = require ('express');
const path = require('path');
const fs = require('fs');

const router = Router();
const secret_key = "314637895421658";


// ROUTES

// POST login
router.get('/hola', (req, res) => {
    res.json({ mensaje: 'Hola desde el backend' });
});


module.exports = router;
