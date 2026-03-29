const { sendError } = require('../utils/response');

/**
 * Tratamento centralizado de erros do Express.
 * Deve ser registrado APÓS todas as rotas no app.js.
 *
 * Trata casos específicos do Prisma e erros genéricos,
 * garantindo que nenhum stack trace vaze em produção.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Log detalhado em desenvolvimento
  if (isDev) {
    console.error('[ErrorHandler]', err);
  }

  // ─── Erros do Prisma ──────────────────────────────────────────────────────

  // P2002: violação de constraint unique (ex: email duplicado)
  if (err.code === 'P2002') {
    const campo = err.meta?.target?.[0] || 'campo';
    return sendError(res, `Já existe um registro com este ${campo}`, 409);
  }

  // P2025: registro não encontrado em operações de update/delete
  if (err.code === 'P2025') {
    return sendError(res, 'Recurso não encontrado', 404);
  }

  // ─── Erros de sintaxe no JSON do body ────────────────────────────────────
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 'JSON inválido no corpo da requisição', 400);
  }

  // ─── Erro genérico ────────────────────────────────────────────────────────
  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode < 500
      ? err.message
      : isDev
        ? err.message
        : 'Erro interno do servidor';

  return sendError(res, message, statusCode);
};

/**
 * Middleware para rotas não encontradas (404).
 */
const notFound = (req, res) => {
  return sendError(res, `Rota ${req.method} ${req.path} não encontrada`, 404);
};

module.exports = { errorHandler, notFound };
