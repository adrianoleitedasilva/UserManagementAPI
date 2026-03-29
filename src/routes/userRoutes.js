const { Router } = require('express');
const userController = require('../controllers/userController');
const { validate } = require('../middlewares/validate');
const {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
} = require('../validations/userValidation');

const router = Router();

/**
 * @route   GET /users
 * @desc    Lista todos os usuários com paginação e filtros
 * @query   page, limit, nome, email
 * @access  Public
 */
router.get('/', validate(listUsersSchema, 'query'), userController.listUsers);

/**
 * @route   GET /users/:id
 * @desc    Busca usuário por ID
 * @access  Public
 */
router.get('/:id', userController.getUserById);

/**
 * @route   POST /users
 * @desc    Cria um novo usuário
 * @body    { nome, email, senha, telefone? }
 * @access  Public
 */
router.post('/', validate(createUserSchema), userController.createUser);

/**
 * @route   PUT /users/:id
 * @desc    Atualiza dados de um usuário existente
 * @body    { nome?, email?, senha?, telefone? }
 * @access  Public
 */
router.put('/:id', validate(updateUserSchema), userController.updateUser);

/**
 * @route   DELETE /users/:id
 * @desc    Remove um usuário pelo ID
 * @access  Public
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
