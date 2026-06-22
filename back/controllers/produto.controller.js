const prisma = require('../prisma/client');

// Listar todos os produtos
async function listar(req, res) {
  try {
    const { categoriaId, ativo, busca } = req.query;

    const where = {};
    if (categoriaId) where.categoriaId = Number(categoriaId);
    if (ativo !== undefined) where.ativo = ativo === 'true';
    if (busca) where.nome = { contains: busca, mode: 'insensitive' };

    const produtos = await prisma.produto.findMany({
      where,
      include: { categoria: { select: { id: true, nome: true } } },
      orderBy: { nome: 'asc' },
    });

    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar produtos', detalhes: err.message });
  }
}

// Buscar produto por ID
async function buscarPorId(req, res) {
  const { id } = req.params;
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
      include: {
        categoria: true,
        movimentos: { orderBy: { criadoEm: 'desc' }, take: 10 },
      },
    });

    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produto', detalhes: err.message });
  }
}

// Criar novo produto
async function criar(req, res) {
  const { nome, descricao, preco, estoque, estoqueMin, categoriaId } = req.body;

  if (!nome || !preco || !categoriaId) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, preco, categoriaId' });
  }

  try {
    const produto = await prisma.$transaction(async (tx) => {
      const novo = await tx.produto.create({
        data: {
          nome,
          descricao,
          preco: Number(preco),
          estoque: Number(estoque) || 0,
          estoqueMin: Number(estoqueMin) || 5,
          categoriaId: Number(categoriaId),
        },
        include: { categoria: true },
      });

      if (estoque && Number(estoque) > 0) {
        await tx.movimentoEstoque.create({
          data: {
            tipo: 'ENTRADA',
            quantidade: Number(estoque),
            observacao: 'Estoque inicial do produto',
            produtoId: novo.id,
          },
        });
      }

      return novo;
    });

    res.status(201).json(produto);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar produto', detalhes: err.message });
  }
}

// Atualizar produto
async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, descricao, preco, estoqueMin, categoriaId, ativo } = req.body;

  try {
    const produto = await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(preco !== undefined && { preco: Number(preco) }),
        ...(estoqueMin !== undefined && { estoqueMin: Number(estoqueMin) }),
        ...(categoriaId !== undefined && { categoriaId: Number(categoriaId) }),
        ...(ativo !== undefined && { ativo }),
      },
      include: { categoria: true },
    });

    res.json(produto);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ erro: 'Produto não encontrado' });
    res.status(500).json({ erro: 'Erro ao atualizar produto', detalhes: err.message });
  }
}

// Deletar produto (soft delete - desativa)
async function deletar(req, res) {
  const { id } = req.params;
  try {
    await prisma.produto.update({
      where: { id: Number(id) },
      data: { ativo: false },
    });
    res.json({ mensagem: 'Produto desativado com sucesso' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ erro: 'Produto não encontrado' });
    res.status(500).json({ erro: 'Erro ao deletar produto', detalhes: err.message });
  }
}

// Produtos com estoque baixo
async function estoqueBaixo(req, res) {
  try {
    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
        // Prisma não suporta comparação entre colunas diretamente no where, usamos raw
      },
      include: { categoria: true },
    });

    const baixos = produtos.filter(p => p.estoque <= p.estoqueMin);
    res.json(baixos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produtos com estoque baixo', detalhes: err.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar, estoqueBaixo };
