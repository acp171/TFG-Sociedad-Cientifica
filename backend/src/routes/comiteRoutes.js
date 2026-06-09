const express = require('express');
const router = express.Router();
const comiteController = require('../controllers/comiteController');
const { verificarToken, verificarSuscripcionActiva } = require('../middlewares/authMiddleware');

router.get('/listado-comites-cientificos', verificarToken, comiteController.getComites);
router.get('/comites/:id/mensajes', verificarToken, comiteController.getMensajes);

router.post('/crear-comite-cientifico', verificarSuscripcionActiva, comiteController.createComite);
router.post('/add-miembro-comite-cientifico', verificarToken, comiteController.addMiembro);
router.delete('/eliminar-miembro-comite', verificarToken, comiteController.removeMiembro);
router.delete('/comites/:id', verificarToken, comiteController.deleteComite);

router.post('/comites/:id/mensajes', verificarToken, comiteController.sendMensaje);

module.exports = router;
