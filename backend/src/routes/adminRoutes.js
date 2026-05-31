const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/roles', verificarToken, adminController.getRoles);
router.post('/roles', verificarToken, adminController.createRol);
router.put('/roles/:id', verificarToken, adminController.updateRol);
router.delete('/roles/:id', verificarToken, adminController.deleteRol);

router.get('/tipos', verificarToken, adminController.getTipos);
router.post('/tipos', verificarToken, adminController.createTipo);
router.put('/tipos/:id', verificarToken, adminController.updateTipo);
router.delete('/tipos/:id', verificarToken, adminController.deleteTipo);

router.put('/asignar-rol', verificarToken, adminController.asignarRol);
router.delete('/eliminar-rol', verificarToken, adminController.eliminarRol);

router.get('/buscar-calles', adminController.buscarCalles);

module.exports = router;
