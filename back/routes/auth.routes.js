const express = require('express');
const router = express.Router();
const { login, cadastrar, perfil } = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth.middleware');

router.post('/login',    login);
router.post('/cadastrar', cadastrar);
router.get('/perfil',    autenticar, perfil);

module.exports = router;
