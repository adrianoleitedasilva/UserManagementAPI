require('dotenv').config();

const app = require('./app');
const prisma = require('./database/prisma');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Verifica conexão com o banco antes de subir o servidor
    await prisma.$connect();
    console.log('✔ Conectado ao banco de dados');

    app.listen(PORT, () => {
      console.log(`✔ Servidor rodando em http://localhost:${PORT}`);
      console.log(`  Ambiente: ${process.env.NODE_ENV}`);
      console.log(`  Health:   http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('✖ Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
}

// Garante que o Prisma seja desconectado ao encerrar o processo
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\nServidor encerrado.');
  process.exit(0);
});

start();
