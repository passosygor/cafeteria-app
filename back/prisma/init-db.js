const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const prisma = require('./client');
const { seed } = require('./seed');

const backDir = path.join(__dirname, '..');
const dbPath = path.join(__dirname, 'cafeteria.db');

async function initDatabase() {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log('📦 Verificando banco de dados SQLite...');

  execSync('npx prisma generate', {
    cwd: backDir,
    stdio: 'inherit',
    env: { ...process.env },
  });

  execSync('npx prisma migrate deploy', {
    cwd: backDir,
    stdio: 'inherit',
    env: { ...process.env },
  });

  const usuarioCount = await prisma.usuario.count();

  if (usuarioCount === 0) {
    console.log('🌱 Banco vazio — executando seed inicial...');
    await seed();
  } else {
    console.log('✅ Banco de dados pronto');
  }
}

module.exports = { initDatabase };
