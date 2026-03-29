/**
 * Helpers para padronizar todas as respostas da API.
 * Garante que sucesso e erro sempre tenham o mesmo formato JSON.
 */

/**
 * Resposta de sucesso.
 * @param {object} res - objeto response do Express
 * @param {*} data - payload a retornar
 * @param {string} [message] - mensagem descritiva opcional
 * @param {number} [statusCode=200] - código HTTP
 */
const sendSuccess = (res, data, message = 'Operação realizada com sucesso', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Resposta de erro.
 * @param {object} res - objeto response do Express
 * @param {string} message - mensagem de erro
 * @param {number} [statusCode=500] - código HTTP
 * @param {*} [errors=null] - detalhes adicionais (ex: erros de validação)
 */
const sendError = (res, message = 'Erro interno do servidor', statusCode = 500, errors = null) => {
  const body = {
    success: false,
    message,
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
