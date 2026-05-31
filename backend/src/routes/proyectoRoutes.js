const express = require('express');
const router = express.Router();
const proyectoController = require('../controllers/proyectoController');
const { verificarToken, verificarSuscripcionActiva } = require('../middlewares/authMiddleware');

router.get('/listado-proyectos-investigacion', proyectoController.getProyectos);
router.get('/proyectos-investigacion/:id', proyectoController.getProyectoById);

router.post('/proyectos-investigacion/crear-proyecto-investigacion', verificarSuscripcionActiva, proyectoController.createProyecto);
router.put('/proyectos-investigacion/:id', verificarToken, proyectoController.updateProyecto);
router.delete('/proyectos-investigacion/:id', verificarToken, proyectoController.deleteProyecto);

router.post('/proyectos-investigacion/:id/miembros', verificarToken, proyectoController.addMiembro);
router.delete('/proyectos-investigacion/:id/miembros/:id_socio', verificarToken, proyectoController.removeMiembro);

module.exports = router;
