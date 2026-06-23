require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./prisma/init-db');

const authRoutes     = require('./routes/auth.routes');
const produtoRoutes  = require('./routes/produto.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const usuarioRoutes  = require('./routes/usuario.routes');
const pedidoRoutes   = require('./routes/pedido.routes');
const estoqueRoutes  = require('./routes/estoque.routes');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Rotas
app.use('/api/auth',       authRoutes);
app.use('/api/produtos',   produtoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/usuarios',   usuarioRoutes);
app.use('/api/pedidos',    pedidoRoutes);
app.use('/api/estoque',    estoqueRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Handler de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor', detalhes: err.message });
});

const PORT = process.env.PORT || 3001;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`☕ Servidor da Cafeteria rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Falha ao inicializar o banco de dados:', err.message);
    process.exit(1);
  });
