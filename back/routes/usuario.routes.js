const express = require('express');
const router = express.Router();
const { listar, buscarPorId, criar, atualizar, deletar } = require('../controllers/usuario.controller');
const { autenticar, apenasAdmin } = require('../middlewares/auth.middleware');

router.get('/',       autenticar, apenasAdmin, listar);
router.get('/:id',    autenticar, apenasAdmin, buscarPorId);
router.post('/',      autenticar, apenasAdmin, criar);
router.put('/:id',    autenticar, apenasAdmin, atualizar);
router.delete('/:id', autenticar, apenasAdmin, deletar);

module.exports = router;
