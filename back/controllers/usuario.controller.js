const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');

async function listar(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, cpf: true, telefone: true, role: true, ativo: true, criadoEm: true },
      orderBy: { nome: 'asc' },
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar usuários', detalhes: err.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, nome: true, email: true, cpf: true, telefone: true, role: true, ativo: true, criadoEm: true, assinatura: true },
    });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuário', detalhes: err.message });
  }
}

async function criar(req, res) {
  const { nome, email, senha, cpf, telefone, role } = req.body;
  if (!nome || !email || !senha || !cpf || !telefone) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, cpf, telefone' });
  }
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash, cpf, telefone, role: role || 'CLIENTE' },
      select: { id: true, nome: true, email: true, cpf: true, telefone: true, role: true, criadoEm: true },
    });
    res.status(201).json(usuario);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ erro: 'E-mail ou CPF já cadastrado' });
    res.status(500).json({ erro: 'Erro ao criar usuário', detalhes: err.message });
  }
}

async function atualizar(req, res) {
  const { nome, telefone, ativo, role } = req.body;
  try {
    const usuario = await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(nome && { nome }),
        ...(telefone && { telefone }),
        ...(ativo !== undefined && { ativo }),
        ...(role && { role }),
      },
      select: { id: true, nome: true, email: true, cpf: true, telefone: true, role: true, ativo: true },
    });
    res.json(usuario);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhes: err.message });
  }
}

async function deletar(req, res) {
  try {
    await prisma.usuario.update({ where: { id: Number(req.params.id) }, data: { ativo: false } });
    res.json({ mensagem: 'Usuário desativado com sucesso' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.status(500).json({ erro: 'Erro ao deletar usuário', detalhes: err.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };
