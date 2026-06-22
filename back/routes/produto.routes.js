const express = require('express');
const router = express.Router();
const { listar, buscarPorId, criar, atualizar, deletar, estoqueBaixo } = require('../controllers/produto.controller');
const { autenticar, adminOuFuncionario } = require('../middlewares/auth.middleware');

router.get('/',              autenticar, listar);
router.get('/estoque-baixo', autenticar, adminOuFuncionario, estoqueBaixo);
router.get('/:id',           autenticar, buscarPorId);
router.post('/',             autenticar, adminOuFuncionario, criar);
router.put('/:id',           autenticar, adminOuFuncionario, atualizar);
router.delete('/:id',        autenticar, adminOuFuncionario, deletar);

module.exports = router;
