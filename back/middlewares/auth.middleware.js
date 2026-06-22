const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(403).json({ erro: 'Token inválido ou expirado' });
  }
}

function apenasAdmin(req, res, next) {
  if (req.usuario.role !== 'ADMIN') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }
  next();
}

function adminOuFuncionario(req, res, next) {
  if (req.usuario.role === 'CLIENTE') {
    return res.status(403).json({ erro: 'Acesso restrito à equipe interna' });
  }
  next();
}

module.exports = { autenticar, apenasAdmin, adminOuFuncionario };
