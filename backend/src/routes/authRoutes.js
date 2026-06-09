const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/tipos-publico', authController.getPublicTipos);

module.exports = router;
