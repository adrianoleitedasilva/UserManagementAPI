const { z } = require('zod');

// ─── Schemas de validação com Zod ───────────────────────────────────────────

const createUserSchema = z.object({
  nome: z
    .string({ required_error: 'O nome é obrigatório' })
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome pode ter no máximo 100 caracteres')
    .trim(),

  email: z
    .string({ required_error: 'O email é obrigatório' })
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),

  senha: z
    .string({ required_error: 'A senha é obrigatória' })
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(100, 'A senha pode ter no máximo 100 caracteres'),

  telefone: z
    .string()
    .regex(/^\(?\d{2}\)?[\s-]?9?\d{4}[-\s]?\d{4}$/, 'Formato de telefone inválido')
    .optional()
    .or(z.literal('')),
});

const updateUserSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome pode ter no máximo 100 caracteres')
    .trim()
    .optional(),

  email: z
    .string()
    .email('Formato de email inválido')
    .toLowerCase()
    .trim()
    .optional(),

  senha: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(100, 'A senha pode ter no máximo 100 caracteres')
    .optional(),

  telefone: z
    .string()
    .regex(/^\(?\d{2}\)?[\s-]?9?\d{4}[-\s]?\d{4}$/, 'Formato de telefone inválido')
    .optional()
    .nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser informado para atualização',
});

const listUsersSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive('O número de página deve ser positivo')),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100, 'O limite máximo por página é 100')),

  nome: z.string().trim().optional(),

  email: z.string().trim().optional(),
});

module.exports = { createUserSchema, updateUserSchema, listUsersSchema };
