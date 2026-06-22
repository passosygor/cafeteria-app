const express = require('express');
const router = express.Router();
const { listar, buscarPorId, criar, atualizarStatus } = require('../controllers/pedido.controller');
const { autenticar, adminOuFuncionario } = require('../middlewares/auth.middleware');

router.get('/',           autenticar, listar);
router.get('/:id',        autenticar, buscarPorId);
router.post('/',          autenticar, criar);
router.patch('/:id/status', autenticar, adminOuFuncionario, atualizarStatus);

module.exports = router;
