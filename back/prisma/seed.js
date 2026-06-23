const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seed() {
  const prisma = new PrismaClient();
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    const senhaHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.usuario.upsert({
      where: { email: 'admin@cafeteria.com' },
      update: {},
      create: {
        nome: 'Administrador',
        email: 'admin@cafeteria.com',
        senha: senhaHash,
        cpf: '000.000.000-00',
        telefone: '(48) 99999-0000',
        role: 'ADMIN',
      },
    });

    await prisma.usuario.upsert({
      where: { email: 'func@cafeteria.com' },
      update: {},
      create: {
        nome: 'Funcionário Teste',
        email: 'func@cafeteria.com',
        senha: senhaHash,
        cpf: '111.111.111-11',
        telefone: '(48) 99999-0001',
        role: 'FUNCIONARIO',
      },
    });

    const cliente = await prisma.usuario.upsert({
      where: { email: 'cliente@email.com' },
      update: {},
      create: {
        nome: 'Cliente Teste',
        email: 'cliente@email.com',
        senha: senhaHash,
        cpf: '222.222.222-22',
        telefone: '(48) 99999-0002',
        role: 'CLIENTE',
      },
    });

    const categorias = await Promise.all([
      prisma.categoria.upsert({ where: { nome: 'Cafés' }, update: {}, create: { nome: 'Cafés', descricao: 'Bebidas à base de café' } }),
      prisma.categoria.upsert({ where: { nome: 'Bebidas Frias' }, update: {}, create: { nome: 'Bebidas Frias', descricao: 'Sucos, refrigerantes e outras bebidas geladas' } }),
      prisma.categoria.upsert({ where: { nome: 'Salgados' }, update: {}, create: { nome: 'Salgados', descricao: 'Pães, croissants, sanduíches e salgados' } }),
      prisma.categoria.upsert({ where: { nome: 'Doces' }, update: {}, create: { nome: 'Doces', descricao: 'Bolos, tortas e sobremesas' } }),
      prisma.categoria.upsert({ where: { nome: 'Insumos' }, update: {}, create: { nome: 'Insumos', descricao: 'Ingredientes e suprimentos internos' } }),
    ]);

    const [cafe, fria, salgado, doce, insumo] = categorias;

    const produtosData = [
      { nome: 'Espresso Simples', descricao: 'Café espresso tradicional 50ml', preco: 5.00, estoque: 100, estoqueMin: 20, categoriaId: cafe.id },
      { nome: 'Cappuccino', descricao: 'Espresso com leite vaporizado e espuma', preco: 9.50, estoque: 80, estoqueMin: 15, categoriaId: cafe.id },
      { nome: 'Café Latte', descricao: 'Espresso com leite cremoso', preco: 9.00, estoque: 80, estoqueMin: 15, categoriaId: cafe.id },
      { nome: 'Americano', descricao: 'Espresso diluído em água quente', preco: 6.50, estoque: 90, estoqueMin: 20, categoriaId: cafe.id },
      { nome: 'Cold Brew', descricao: 'Café coado a frio por 12h', preco: 11.00, estoque: 40, estoqueMin: 10, categoriaId: fria.id },
      { nome: 'Suco de Laranja', descricao: 'Suco natural 300ml', preco: 8.00, estoque: 30, estoqueMin: 10, categoriaId: fria.id },
      { nome: 'Croissant Simples', descricao: 'Croissant folhado manteiga', preco: 7.00, estoque: 50, estoqueMin: 10, categoriaId: salgado.id },
      { nome: 'Croissant Presunto', descricao: 'Croissant com presunto e queijo', preco: 12.00, estoque: 30, estoqueMin: 8, categoriaId: salgado.id },
      { nome: 'Pão de Queijo', descricao: 'Pão de queijo mineiro 3 unidades', preco: 8.50, estoque: 60, estoqueMin: 15, categoriaId: salgado.id },
      { nome: 'Bolo de Cenoura', descricao: 'Bolo de cenoura com cobertura chocolate', preco: 8.00, estoque: 20, estoqueMin: 5, categoriaId: doce.id },
      { nome: 'Brownie', descricao: 'Brownie de chocolate belga', preco: 7.50, estoque: 25, estoqueMin: 5, categoriaId: doce.id },
      { nome: 'Grão de Café 250g', descricao: 'Grão arábica torrado médio', preco: 35.00, estoque: 50, estoqueMin: 10, categoriaId: insumo.id },
    ];

    for (const p of produtosData) {
      const existe = await prisma.produto.findFirst({ where: { nome: p.nome } });
      if (!existe) {
        const produto = await prisma.produto.create({ data: p });
        await prisma.movimentoEstoque.create({
          data: { tipo: 'ENTRADA', quantidade: p.estoque, observacao: 'Estoque inicial', produtoId: produto.id },
        });
      }
    }

    await prisma.assinatura.upsert({
      where: { usuarioId: cliente.id },
      update: {},
      create: {
        plano: 'MENSAL',
        valorMensal: 49.90,
        renovacaoEm: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usuarioId: cliente.id,
      },
    });

    console.log('✅ Seed concluído com sucesso!');
    console.log('📧 Usuários de teste:');
    console.log('   admin@cafeteria.com  | senha: admin123 | role: ADMIN');
    console.log('   func@cafeteria.com   | senha: admin123 | role: FUNCIONARIO');
    console.log('   cliente@email.com    | senha: admin123 | role: CLIENTE');
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { seed };
