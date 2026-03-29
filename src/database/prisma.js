const { PrismaClient } = require('@prisma/client');

// Singleton do PrismaClient — evita múltiplas conexões em ambiente de desenvolvimento
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
