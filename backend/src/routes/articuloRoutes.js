const express = require('express');
const router = express.Router();
const articuloController = require('../controllers/articuloController');
const { verificarToken, verificarSuscripcionActiva } = require('../middlewares/authMiddleware');
const upload = require('../utils/uploadCloudinary');

router.get('/listado-articulos-cientificos', articuloController.getArticulos);
router.get('/articulos-cientificos/:id', articuloController.getArticuloById);
router.get('/articulos-cientificos/:id/pdf', articuloController.downloadPDF);

router.post('/articulos-cientificos/publicar-articulo-cientifico', verificarSuscripcionActiva, upload.single('pdf'), articuloController.createArticulo);
router.delete('/articulos-cientificos/:id', verificarToken, articuloController.deleteArticulo);

router.post('/articulos-cientificos/:id/comentarios', verificarToken, articuloController.addComentario);
router.patch('/articulos-cientificos/:id/comentarios/:id_comentario/moderar', verificarToken, articuloController.moderarComentario);

module.exports = router;
