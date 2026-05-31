const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { verificarToken, verificarSuscripcionActiva } = require('../middlewares/authMiddleware');

router.get('/listado-eventos-cientificos', eventoController.getEventos);
router.get('/eventos-cientificos/:id', eventoController.getEventoById);
router.get('/incripciones/listado-incripciones-usuario', verificarToken, eventoController.getMisInscripciones);

router.post('/eventos-cientificos/crear-evento-cientifico', verificarSuscripcionActiva, eventoController.createEvento);
router.put('/eventos-cientificos/:id', verificarToken, eventoController.updateEvento);
router.delete('/eventos-cientificos/:id', verificarToken, eventoController.deleteEvento);

router.post('/eventos-cientificos/:id/inscribirse', verificarSuscripcionActiva, eventoController.inscribirse);
router.delete('/eventos-cientificos/:id/cancelar-inscripcion', verificarToken, eventoController.cancelarInscripcion);

module.exports = router;
