const userService = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Controllers são responsáveis apenas por:
 * 1. Extrair dados do request
 * 2. Chamar o service correspondente
 * 3. Formatar e enviar a resposta
 *
 * Toda regra de negócio fica no service.
 */

// GET /users
const listUsers = async (req, res, next) => {
  try {
    const { page, limit, nome, email } = req.query;
    const result = await userService.listUsers({ page, limit, nome, email });
    return sendSuccess(res, result, 'Usuários listados com sucesso');
  } catch (err) {
    next(err);
  }
};

// GET /users/:id
const getUserById = async (req, res, next) => {
  try {
    const usuario = await userService.getUserById(req.params.id);
    return sendSuccess(res, { usuario }, 'Usuário encontrado');
  } catch (err) {
    next(err);
  }
};

// POST /users
const createUser = async (req, res, next) => {
  try {
    const usuario = await userService.createUser(req.body);
    return sendSuccess(res, { usuario }, 'Usuário criado com sucesso', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /users/:id
const updateUser = async (req, res, next) => {
  try {
    const usuario = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, { usuario }, 'Usuário atualizado com sucesso');
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return sendSuccess(res, null, 'Usuário removido com sucesso');
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
