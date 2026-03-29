const { sendError } = require('../utils/response');

/**
 * Middleware genérico de validação com Zod.
 * Recebe um schema Zod e a origem dos dados ('body', 'query', 'params').
 *
 * @param {import('zod').ZodSchema} schema - schema Zod para validar
 * @param {'body'|'query'|'params'} [source='body'] - onde os dados estão no request
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Formata os erros do Zod para uma estrutura clara
      const errors = result.error.errors.map((err) => ({
        campo: err.path.join('.') || 'geral',
        mensagem: err.message,
      }));

      return sendError(res, 'Erro de validação', 422, errors);
    }

    // Sobrescreve os dados do request com os dados já validados/transformados
    req[source] = result.data;
    next();
  };
};

module.exports = { validate };
