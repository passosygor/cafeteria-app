# Ygor dos Passos, Matheus Mathias e Nicolas Carlos

# ☕ Sistema de Gestão – Cafeteria

Sistema B2B para gestão interna de uma cafeteria, com controle de produtos, estoque, pedidos (takeaway), usuários e assinaturas.

---

## 🛠 Tecnologias

- **Backend:** Node.js + Express
- **ORM:** Prisma
- **Banco de dados:** SQLite (criado automaticamente na primeira execução)
- **Frontend:** React

---

## 📁 Estrutura do Projeto

```
cafeteria/
├── forms.md            ← Respostas do formulário do cliente
├── back/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   └── prisma/
│       ├── schema.prisma
│       ├── init-db.js     ← Inicializa banco e seed automaticamente
│       ├── seed.js
│       ├── migrations/
│       └── client.js
└── front/
    └── src/
        ├── pages/
        ├── components/
        ├── services/
        └── styles/
```

---

## ⚙️ Como rodar

### 1. Pré-requisitos

- Node.js 18+

> **Não é necessário instalar PostgreSQL.** O banco SQLite é criado automaticamente na primeira execução do backend.

### 2. Configurar e iniciar o Backend

```bash
cd back
cp .env.example .env   # ou copie manualmente no Windows
npm install
npm run dev
# Servidor rodando em http://localhost:3001
```

Na **primeira execução**, o servidor:
1. Gera o Prisma Client
2. Aplica as migrations (cria `prisma/cafeteria.db`)
3. Popula o banco com dados iniciais (usuários, categorias, produtos)

O arquivo `.env` padrão:
```
DATABASE_URL="file:./cafeteria.db"
JWT_SECRET="cafeteria_jwt_secret_troque_em_producao"
PORT=3001
```

### 3. Configurar e rodar o Frontend

```bash
cd front
npm install
npm start
# App rodando em http://localhost:3000
```

---

## 👤 Usuários padrão (seed)

| E-mail | Senha | Perfil |
|---|---|---|
| admin@cafeteria.com | admin123 | Administrador |
| func@cafeteria.com | admin123 | Funcionário |
| cliente@email.com | admin123 | Cliente |

Também é possível **criar uma conta nova** pela tela de login → "Criar conta".

---

## 🔗 Principais Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/cadastrar | Cadastro de cliente |
| GET | /api/produtos | Listar produtos |
| POST | /api/produtos | Criar produto |
| PUT | /api/produtos/:id | Atualizar produto |
| DELETE | /api/produtos/:id | Desativar produto |
| GET | /api/estoque | Listar movimentações |
| POST | /api/estoque | Registrar entrada/saída |
| GET | /api/categorias | Listar categorias |
| GET | /api/pedidos | Listar pedidos |
| POST | /api/pedidos | Criar pedido |
| PATCH | /api/pedidos/:id/status | Atualizar status |
| GET | /api/usuarios | Listar usuários (admin) |

---

## 📋 CRUD Principal: Produtos

O CRUD completo de produtos inclui:
- ✅ **Listar** com filtros por categoria e busca por nome
- ✅ **Criar** com estoque inicial e movimento automático
- ✅ **Atualizar** nome, descrição, preço, categoria, estoque mínimo
- ✅ **Deletar** (soft delete – desativa o produto)
- ✅ **Movimentar estoque** (entrada/saída com histórico)

---

## 🔐 Níveis de acesso

| Funcionalidade | Admin | Funcionário | Cliente |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Ver Produtos | ✅ | ✅ | ✅ |
| Gerenciar Produtos | ✅ | ✅ | ❌ |
| Movimentar Estoque | ✅ | ✅ | ❌ |
| Gerenciar Categorias | ✅ | ✅ | ❌ |
| Criar Pedidos | ✅ | ✅ | ✅ |
| Gerenciar Usuários | ✅ | ❌ | ❌ |

---

## 🗄️ Banco de dados

O arquivo do banco fica em `back/prisma/cafeteria.db` (criado automaticamente). Para resetar tudo:

```bash
cd back
# Apague o arquivo cafeteria.db e reinicie o servidor
npm run dev
```

Para rodar o seed manualmente:

```bash
cd back
npm run prisma:seed
```
