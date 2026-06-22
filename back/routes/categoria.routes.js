const express = require('express');
const router = express.Router();
const { listar, criar, atualizar, deletar } = require('../controllers/categoria.controller');
const { autenticar, adminOuFuncionario } = require('../middlewares/auth.middleware');

router.get('/',      autenticar, listar);
router.post('/',     autenticar, adminOuFuncionario, criar);
router.put('/:id',   autenticar, adminOuFuncionario, atualizar);
router.delete('/:id', autenticar, adminOuFuncionario, deletar);

module.exports = router;
