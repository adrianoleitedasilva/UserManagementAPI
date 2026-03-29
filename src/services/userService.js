const bcrypt = require('bcryptjs');
const prisma = require('../database/prisma');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

// ─── Campos seguros para retornar (nunca expõe a senha) ──────────────────────
const safeUserSelect = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  createdAt: true,
  updatedAt: true,
};

// ─── Serviços ────────────────────────────────────────────────────────────────

/**
 * Lista usuários com paginação e filtros opcionais.
 */
async function listUsers({ page = 1, limit = 10, nome, email }) {
  const skip = (page - 1) * limit;

  const where = {};
  if (nome) {
    // SQLite não suporta mode:'insensitive'; o LIKE nativo já é case-insensitive para ASCII
    where.nome = { contains: nome };
  }
  if (email) {
    where.email = { contains: email };
  }

  const [usuarios, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    usuarios,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Busca um usuário pelo ID.
 * Lança erro 404 se não encontrado.
 */
async function getUserById(id) {
  const usuario = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });

  if (!usuario) {
    const err = new Error('Usuário não encontrado');
    err.statusCode = 404;
    throw err;
  }

  return usuario;
}

/**
 * Cria um novo usuário.
 * Verifica unicidade do email e faz hash da senha.
 */
async function createUser({ nome, email, senha, telefone }) {
  // Verifica se o email já está em uso
  const emailExistente = await prisma.user.findUnique({ where: { email } });
  if (emailExistente) {
    const err = new Error('Este email já está em uso');
    err.statusCode = 409;
    throw err;
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  const usuario = await prisma.user.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      telefone: telefone || null,
    },
    select: safeUserSelect,
  });

  return usuario;
}

/**
 * Atualiza os dados de um usuário existente.
 * Apenas os campos fornecidos são alterados.
 */
async function updateUser(id, { nome, email, senha, telefone }) {
  // Garante que o usuário existe antes de atualizar
  await getUserById(id);

  // Se está tentando alterar o email, verifica unicidade
  if (email) {
    const emailExistente = await prisma.user.findFirst({
      where: { email, NOT: { id } },
    });
    if (emailExistente) {
      const err = new Error('Este email já está em uso por outro usuário');
      err.statusCode = 409;
      throw err;
    }
  }

  const data = {};
  if (nome !== undefined) data.nome = nome;
  if (email !== undefined) data.email = email;
  if (telefone !== undefined) data.telefone = telefone;
  if (senha !== undefined) {
    data.senha = await bcrypt.hash(senha, SALT_ROUNDS);
  }

  const usuario = await prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect,
  });

  return usuario;
}

/**
 * Remove um usuário pelo ID.
 */
async function deleteUser(id) {
  // Garante que o usuário existe antes de remover
  await getUserById(id);

  await prisma.user.delete({ where: { id } });
}

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
