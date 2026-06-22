const prisma = require('../prisma/client');

async function listar(req, res) {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      include: { _count: { select: { produtos: true } } },
      orderBy: { nome: 'asc' },
    });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar categorias', detalhes: err.message });
  }
}

async function criar(req, res) {
  const { nome, descricao } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });

  try {
    const categoria = await prisma.categoria.create({ data: { nome, descricao } });
    res.status(201).json(categoria);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ erro: 'Categoria já existe' });
    res.status(500).json({ erro: 'Erro ao criar categoria', detalhes: err.message });
  }
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, descricao, ativo } = req.body;
  try {
    const categoria = await prisma.categoria.update({
      where: { id: Number(id) },
      data: { ...(nome && { nome }), ...(descricao !== undefined && { descricao }), ...(ativo !== undefined && { ativo }) },
    });
    res.json(categoria);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.status(500).json({ erro: 'Erro ao atualizar categoria', detalhes: err.message });
  }
}

async function deletar(req, res) {
  const { id } = req.params;
  try {
    await prisma.categoria.update({ where: { id: Number(id) }, data: { ativo: false } });
    res.json({ mensagem: 'Categoria desativada com sucesso' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.status(500).json({ erro: 'Erro ao deletar categoria', detalhes: err.message });
  }
}

module.exports = { listar, criar, atualizar, deletar };
