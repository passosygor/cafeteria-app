const prisma = require('../prisma/client');

// Registrar entrada ou saída de estoque
async function registrarMovimento(req, res) {
  const { produtoId, tipo, quantidade, observacao } = req.body;

  if (!produtoId || !tipo || !quantidade) {
    return res.status(400).json({ erro: 'Campos obrigatórios: produtoId, tipo (ENTRADA/SAIDA), quantidade' });
  }

  if (!['ENTRADA', 'SAIDA'].includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo deve ser ENTRADA ou SAIDA' });
  }

  if (quantidade <= 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser maior que zero' });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({ where: { id: Number(produtoId) } });
      if (!produto) throw new Error('Produto não encontrado');

      if (tipo === 'SAIDA' && produto.estoque < quantidade) {
        throw new Error(`Estoque insuficiente. Atual: ${produto.estoque}`);
      }

      const novoEstoque = tipo === 'ENTRADA'
        ? produto.estoque + Number(quantidade)
        : produto.estoque - Number(quantidade);

      const [movimento] = await Promise.all([
        tx.movimentoEstoque.create({
          data: { tipo, quantidade: Number(quantidade), observacao, produtoId: Number(produtoId) },
          include: { produto: { select: { nome: true } } },
        }),
        tx.produto.update({
          where: { id: Number(produtoId) },
          data: { estoque: novoEstoque },
        }),
      ]);

      return { movimento, estoqueAnterior: produto.estoque, estoqueAtual: novoEstoque };
    });

    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

// Listar movimentos de um produto
async function listarMovimentos(req, res) {
  const { produtoId } = req.params;
  try {
    const movimentos = await prisma.movimentoEstoque.findMany({
      where: { produtoId: Number(produtoId) },
      orderBy: { criadoEm: 'desc' },
    });
    res.json(movimentos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar movimentos', detalhes: err.message });
  }
}

// Listar todos os movimentos recentes
async function listarTodos(req, res) {
  try {
    const movimentos = await prisma.movimentoEstoque.findMany({
      orderBy: { criadoEm: 'desc' },
      take: 50,
      include: { produto: { select: { id: true, nome: true } } },
    });
    res.json(movimentos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar movimentos', detalhes: err.message });
  }
}

module.exports = { registrarMovimento, listarMovimentos, listarTodos };
