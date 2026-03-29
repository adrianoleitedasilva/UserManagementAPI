const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpa usuários existentes para evitar conflito de email único
  await prisma.user.deleteMany();

  const senhaHash = await bcrypt.hash('senha123', 10);

  const usuarios = await prisma.user.createMany({
    data: [
      {
        nome: 'Admin Silva',
        email: 'admin@email.com',
        senha: senhaHash,
        telefone: '(11) 99999-0001',
      },
      {
        nome: 'Maria Souza',
        email: 'maria@email.com',
        senha: senhaHash,
        telefone: '(11) 99999-0002',
      },
      {
        nome: 'João Pereira',
        email: 'joao@email.com',
        senha: senhaHash,
        telefone: null,
      },
    ],
  });

  console.log(`✔ ${usuarios.count} usuários criados com sucesso.`);
}

main()
  .catch((err) => {
    console.error('Erro no seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
