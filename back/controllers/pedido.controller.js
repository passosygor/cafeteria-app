const prisma = require('../prisma/client');

async function listar(req, res) {
  try {
    const { status, usuarioId } = req.query;
    const where = {};
    if (status) where.status = status;

    if (req.usuario.role === 'CLIENTE') {
      where.usuarioId = req.usuario.id;
    } else if (usuarioId) {
      where.usuarioId = Number(usuarioId);
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        itens: { include: { produto: { select: { id: true, nome: true } } } },
      },
      orderBy: { criadoEm: 'desc' },
    });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar pedidos', detalhes: err.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        usuario: { select: { id: true, nome: true, email: true, telefone: true } },
        itens: { include: { produto: true } },
      },
    });
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
    if (req.usuario.role === 'CLIENTE' && pedido.usuarioId !== req.usuario.id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar pedido', detalhes: err.message });
  }
}

async function criar(req, res) {
  const { usuarioId, itens, observacao } = req.body;
  const clienteId = req.usuario.role === 'CLIENTE' ? req.usuario.id : Number(usuarioId);

  if (!clienteId || !itens || itens.length === 0) {
    return res.status(400).json({ erro: 'usuarioId e itens são obrigatórios' });
  }

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      let total = 0;
      const itensComPreco = [];

      for (const item of itens) {
        const produto = await tx.produto.findUnique({ where: { id: Number(item.produtoId) } });
        if (!produto || !produto.ativo) throw new Error(`Produto ${item.produtoId} não disponível`);
        if (produto.estoque < item.quantidade) throw new Error(`Estoque insuficiente para: ${produto.nome}`);

        const subtotal = Number(produto.preco) * Number(item.quantidade);
        total += subtotal;
        itensComPreco.push({ produtoId: produto.id, quantidade: Number(item.quantidade), precoUnit: Number(produto.preco) });

        await tx.produto.update({
          where: { id: produto.id },
          data: { estoque: produto.estoque - Number(item.quantidade) },
        });
        await tx.movimentoEstoque.create({
          data: { tipo: 'SAIDA', quantidade: Number(item.quantidade), observacao: `Pedido gerado`, produtoId: produto.id },
        });
      }

      return tx.pedido.create({
        data: { usuarioId: clienteId, total, observacao, itens: { create: itensComPreco } },
        include: { itens: { include: { produto: { select: { nome: true } } } }, usuario: { select: { nome: true } } },
      });
    });

    res.status(201).json(pedido);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

async function atualizarStatus(req, res) {
  const { status } = req.body;
  const statusValidos = ['PENDENTE', 'EM_PREPARO', 'PRONTO', 'RETIRADO', 'CANCELADO'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}` });
  }

  try {
    const pedido = await prisma.pedido.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });
    res.json(pedido);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ erro: 'Pedido não encontrado' });
    res.status(500).json({ erro: 'Erro ao atualizar status', detalhes: err.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizarStatus };
