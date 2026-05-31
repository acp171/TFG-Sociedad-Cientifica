const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/listado-notificacion-usuario', verificarToken, notificacionController.getMisNotificaciones);
router.get('/listado-notificacion-usuario-sin-leer', verificarToken, notificacionController.getMisNotificacionesSinLeer);
router.get('/listado-notificaciones', verificarToken, notificacionController.getAllNotificaciones);

router.post('/notificacion-usuario', verificarToken, notificacionController.sendNotificacionToSocio);
router.post('/notificacion-contacto', verificarToken, notificacionController.sendNotificacionContacto);
router.patch('/notificaciones/:id/leida', notificacionController.markAsRead);

module.exports = router;
