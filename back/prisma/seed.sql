-- ============================================================
-- SCRIPT BANCO DE DADOS - SISTEMA CAFETERIA
-- PostgreSQL / pgAdmin
-- ============================================================

-- Criar banco de dados (execute este comando separado no pgAdmin)
-- CREATE DATABASE cafeteria_db;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE "Role" AS ENUM ('ADMIN', 'FUNCIONARIO', 'CLIENTE');
CREATE TYPE "PlanoTipo" AS ENUM ('MENSAL', 'ANUAL');
CREATE TYPE "PlanoStatus" AS ENUM ('ATIVO', 'INATIVO', 'CANCELADO');
CREATE TYPE "MovimentoTipo" AS ENUM ('ENTRADA', 'SAIDA');
CREATE TYPE "PedidoStatus" AS ENUM ('PENDENTE', 'EM_PREPARO', 'PRONTO', 'RETIRADO', 'CANCELADO');

-- ============================================================
-- TABELAS
-- ============================================================

CREATE TABLE usuarios (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  senha         VARCHAR(255) NOT NULL,
  cpf           VARCHAR(14)  NOT NULL UNIQUE,
  telefone      VARCHAR(20)  NOT NULL,
  role          "Role"       NOT NULL DEFAULT 'CLIENTE',
  ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
  "criadoEm"   TIMESTAMP    NOT NULL DEFAULT NOW(),
  "atualizadoEm" TIMESTAMP  NOT NULL DEFAULT NOW()
);

CREATE TABLE categorias (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativo     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE produtos (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(255) NOT NULL,
  descricao     TEXT,
  preco         NUMERIC(10,2) NOT NULL,
  estoque       INTEGER NOT NULL DEFAULT 0,
  "estoqueMin"  INTEGER NOT NULL DEFAULT 5,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  "criadoEm"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "atualizadoEm" TIMESTAMP NOT NULL DEFAULT NOW(),
  "categoriaId" INTEGER NOT NULL REFERENCES categorias(id)
);

CREATE TABLE movimentos_estoque (
  id         SERIAL PRIMARY KEY,
  tipo       "MovimentoTipo" NOT NULL,
  quantidade INTEGER NOT NULL,
  observacao TEXT,
  "criadoEm" TIMESTAMP NOT NULL DEFAULT NOW(),
  "produtoId" INTEGER NOT NULL REFERENCES produtos(id)
);

CREATE TABLE assinaturas (
  id             SERIAL PRIMARY KEY,
  plano          "PlanoTipo"   NOT NULL,
  status         "PlanoStatus" NOT NULL DEFAULT 'ATIVO',
  "valorMensal"  NUMERIC(10,2) NOT NULL,
  "inicioEm"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "renovacaoEm"  TIMESTAMP NOT NULL,
  "criadoEm"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "usuarioId"    INTEGER NOT NULL UNIQUE REFERENCES usuarios(id)
);

CREATE TABLE pedidos (
  id            SERIAL PRIMARY KEY,
  status        "PedidoStatus" NOT NULL DEFAULT 'PENDENTE',
  total         NUMERIC(10,2) NOT NULL,
  observacao    TEXT,
  "criadoEm"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "atualizadoEm" TIMESTAMP NOT NULL DEFAULT NOW(),
  "usuarioId"  INTEGER NOT NULL REFERENCES usuarios(id)
);

CREATE TABLE itens_pedido (
  id          SERIAL PRIMARY KEY,
  quantidade  INTEGER NOT NULL,
  "precoUnit" NUMERIC(10,2) NOT NULL,
  "pedidoId"  INTEGER NOT NULL REFERENCES pedidos(id),
  "produtoId" INTEGER NOT NULL REFERENCES produtos(id)
);

-- ============================================================
-- SEED - DADOS INICIAIS
-- ============================================================

-- Senha: admin123 (bcrypt hash)
INSERT INTO usuarios (nome, email, senha, cpf, telefone, role) VALUES
  ('Administrador', 'admin@cafeteria.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO', '000.000.000-00', '(48) 99999-0000', 'ADMIN'),
  ('Funcionário Teste', 'func@cafeteria.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO', '111.111.111-11', '(48) 99999-0001', 'FUNCIONARIO'),
  ('Cliente Teste', 'cliente@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO', '222.222.222-22', '(48) 99999-0002', 'CLIENTE');

INSERT INTO categorias (nome, descricao) VALUES
  ('Cafés', 'Bebidas à base de café'),
  ('Bebidas Frias', 'Sucos, refrigerantes e outras bebidas geladas'),
  ('Salgados', 'Pães, croissants, sanduíches e salgados'),
  ('Doces', 'Bolos, tortas e sobremesas'),
  ('Insumos', 'Ingredientes e suprimentos internos');

INSERT INTO produtos (nome, descricao, preco, estoque, "estoqueMin", "categoriaId") VALUES
  ('Espresso Simples',   'Café espresso tradicional 50ml',       5.00,  100, 20, 1),
  ('Cappuccino',         'Espresso com leite vaporizado e espuma', 9.50, 80, 15, 1),
  ('Café Latte',         'Espresso com leite cremoso',            9.00,  80, 15, 1),
  ('Americano',          'Espresso diluído em água quente',       6.50,  90, 20, 1),
  ('Cold Brew',          'Café coado a frio por 12h',            11.00,  40, 10, 2),
  ('Suco de Laranja',    'Suco natural 300ml',                    8.00,  30, 10, 2),
  ('Croissant Simples',  'Croissant folhado manteiga',            7.00,  50, 10, 3),
  ('Croissant Presunto', 'Croissant com presunto e queijo',      12.00,  30, 8,  3),
  ('Pão de Queijo',      'Pão de queijo mineiro 3 unidades',      8.50,  60, 15, 3),
  ('Bolo de Cenoura',    'Bolo de cenoura com cobertura de chocolate', 8.00, 20, 5, 4),
  ('Brownie',            'Brownie de chocolate belga',             7.50,  25, 5,  4),
  ('Grão de Café 250g',  'Grão arábica torrado médio',           35.00,  50, 10, 5);

INSERT INTO movimentos_estoque (tipo, quantidade, observacao, "produtoId") VALUES
  ('ENTRADA', 100, 'Estoque inicial',  1),
  ('ENTRADA', 80,  'Estoque inicial',  2),
  ('ENTRADA', 80,  'Estoque inicial',  3),
  ('ENTRADA', 90,  'Estoque inicial',  4),
  ('ENTRADA', 40,  'Estoque inicial',  5),
  ('ENTRADA', 30,  'Estoque inicial',  6),
  ('ENTRADA', 50,  'Estoque inicial',  7),
  ('ENTRADA', 30,  'Estoque inicial',  8),
  ('ENTRADA', 60,  'Estoque inicial',  9),
  ('ENTRADA', 20,  'Estoque inicial', 10),
  ('ENTRADA', 25,  'Estoque inicial', 11),
  ('ENTRADA', 50,  'Estoque inicial', 12);

INSERT INTO assinaturas (plano, "valorMensal", "renovacaoEm", "usuarioId") VALUES
  ('MENSAL', 49.90, NOW() + INTERVAL '1 month', 3);
