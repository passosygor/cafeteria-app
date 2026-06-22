# Ygor dos Passos e Matheus Mathias 

# ☕ Sistema de Gestão – Cafeteria

Sistema B2B para gestão interna de uma cafeteria, com controle de produtos, estoque, pedidos (takeaway), usuários e assinaturas.

---

## 🛠 Tecnologias

- **Backend:** Node.js + Express
- **ORM:** Prisma
- **Banco de dados:** PostgreSQL (pgAdmin)
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
│       ├── seed.js
│       ├── seed.sql       ← Script SQL puro (pgAdmin)
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
- PostgreSQL instalado e rodando (pgAdmin)

### 2. Banco de dados (pgAdmin)

1. Abra o **pgAdmin** e crie um banco chamado `cafeteria_db`
2. Você pode executar manualmente o arquivo `back/prisma/seed.sql` no Query Tool do pgAdmin  
   **OU** usar o Prisma (recomendado, veja o passo 4)

### 3. Configurar o Backend

```bash
cd back
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL
npm install
```

O arquivo `.env` deve conter:
```
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/cafeteria_db"
JWT_SECRET="cafeteria_jwt_secret"
PORT=3001
```

### 4. Rodar as migrations e seed (Prisma)

```bash
cd back
npm run prisma:generate
npm run prisma:migrate
node prisma/seed.js
```

### 5. Iniciar o backend

```bash
cd back
npm run dev
# Servidor rodando em http://localhost:3001
```

### 6. Configurar e rodar o Frontend

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

---

## 🔗 Principais Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/cadastrar | Cadastro |
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
