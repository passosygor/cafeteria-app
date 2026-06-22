const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao realizar login', detalhes: err.message });
  }
}

async function cadastrar(req, res) {
  const { nome, email, senha, cpf, telefone } = req.body;

  if (!nome || !email || !senha || !cpf || !telefone) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios: nome, email, senha, cpf, telefone' });
  }

  try {
    const existe = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { cpf }] },
    });

    if (existe) {
      return res.status(409).json({ erro: 'E-mail ou CPF já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash, cpf, telefone, role: 'CLIENTE' },
      select: { id: true, nome: true, email: true, cpf: true, telefone: true, role: true, criadoEm: true },
    });

    res.status(201).json(usuario);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cadastrar usuário', detalhes: err.message });
  }
}

async function perfil(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nome: true, email: true, cpf: true, telefone: true, role: true, assinatura: true },
    });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
}

module.exports = { login, cadastrar, perfil };
