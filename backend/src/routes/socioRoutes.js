const express = require('express');
const router = express.Router();
const socioController = require('../controllers/socioController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/renovar-suscripcion', verificarToken, socioController.renovarSuscripcion);
router.get('/perfil', verificarToken, socioController.getPerfil);
router.patch('/perfil', verificarToken, socioController.updatePerfil);
router.delete('/perfil', verificarToken, socioController.deletePerfil);

// Admin routes
router.get('/socios/listado-socios', verificarToken, socioController.getSocios);
router.post('/socios/crear-socios', verificarToken, socioController.createSocioByAdmin);

// Corporación routes
router.get("/corporacion/miembros", verificarToken, socioController.getCorporacionMiembros);
router.post("/corporacion/miembros", verificarToken, socioController.addCorporacionMiembro);
router.delete("/corporacion/miembros/:id", verificarToken, socioController.deleteCorporacionMiembro);

module.exports = router;
