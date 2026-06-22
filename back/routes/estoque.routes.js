const express = require('express');
const router = express.Router();
const { registrarMovimento, listarMovimentos, listarTodos } = require('../controllers/estoque.controller');
const { autenticar, adminOuFuncionario } = require('../middlewares/auth.middleware');

router.get('/',                    autenticar, adminOuFuncionario, listarTodos);
router.get('/produto/:produtoId',  autenticar, adminOuFuncionario, listarMovimentos);
router.post('/',                   autenticar, adminOuFuncionario, registrarMovimento);

module.exports = router;
