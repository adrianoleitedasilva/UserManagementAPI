# User Management API

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Zod](https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

API REST para gerenciamento de usuários construída com Node.js, Express e Prisma ORM.

## Por que SQLite?

SQLite foi escolhido para facilitar a execução local sem necessidade de instalar e configurar um servidor de banco de dados. Para produção, basta alterar `provider = "sqlite"` para `provider = "postgresql"` no `prisma/schema.prisma` e ajustar a `DATABASE_URL`.

---

## Stack

| Tecnologia       | Papel                |
| ---------------- | -------------------- |
| Node.js 18+      | Runtime              |
| Express 4        | Framework HTTP       |
| Prisma 5         | ORM + migrations     |
| SQLite           | Banco de dados local |
| Zod              | Validação de dados   |
| bcryptjs         | Hash de senhas       |
| helmet           | Headers de segurança |
| cors             | Controle de CORS     |
| morgan           | Logging de requests  |
| Jest + Supertest | Testes de integração |

---

## Instalação

```bash
# 1. Clonar o projeto
git clone <url-do-repositorio>
cd user-management-api

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env se necessário (padrão já funciona para rodar local)

# 4. Gerar o Prisma Client e criar o banco
npm run db:push

# 5. (Opcional) Popular o banco com dados de exemplo
npm run db:seed
```

---

## Executar

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

A API estará disponível em `http://localhost:3000`.

---

## Testes

```bash
npm test
```

Os testes usam um banco SQLite separado (`test.db`) e são isolados entre si.

---

## Estrutura do projeto

```
user-management-api/
├── prisma/
│   ├── schema.prisma       # Modelo do banco
│   └── seed.js             # Script de seed
├── src/
│   ├── controllers/        # Entrada HTTP → chama service → retorna resposta
│   │   └── userController.js
│   ├── services/           # Regras de negócio
│   │   └── userService.js
│   ├── routes/             # Definição das rotas e middlewares por rota
│   │   └── userRoutes.js
│   ├── middlewares/        # Middlewares reutilizáveis
│   │   ├── errorHandler.js # Tratamento centralizado de erros
│   │   └── validate.js     # Validação com Zod
│   ├── validations/        # Schemas Zod
│   │   └── userValidation.js
│   ├── database/
│   │   └── prisma.js       # Singleton do PrismaClient
│   ├── utils/
│   │   └── response.js     # Helpers de resposta padronizada
│   ├── app.js              # Configuração do Express
│   └── server.js           # Entry point
├── tests/
│   └── users.test.js
├── .env
├── .env.example
└── package.json
```

---

## Endpoints

### Health

```
GET /health
```

### Usuários

| Método   | Rota         | Descrição                            |
| -------- | ------------ | ------------------------------------ |
| `GET`    | `/users`     | Listar usuários (paginado + filtros) |
| `GET`    | `/users/:id` | Buscar usuário por ID                |
| `POST`   | `/users`     | Criar usuário                        |
| `PUT`    | `/users/:id` | Atualizar usuário                    |
| `DELETE` | `/users/:id` | Remover usuário                      |

---

## Parâmetros de query (GET /users)

| Parâmetro | Tipo   | Padrão | Descrição                   |
| --------- | ------ | ------ | --------------------------- |
| `page`    | number | 1      | Página atual                |
| `limit`   | number | 10     | Itens por página (máx. 100) |
| `nome`    | string | —      | Filtro parcial por nome     |
| `email`   | string | —      | Filtro parcial por email    |

---

## Exemplos de requisições

### Criar usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "senha": "minhasenha123",
    "telefone": "(11) 99999-0001"
  }'
```

**Resposta 201:**

```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "usuario": {
      "id": "clxyz...",
      "nome": "Maria Silva",
      "email": "maria@email.com",
      "telefone": "(11) 99999-0001",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Listar usuários com paginação e filtro

```bash
curl "http://localhost:3000/users?page=1&limit=5&nome=maria"
```

**Resposta 200:**

```json
{
  "success": true,
  "message": "Usuários listados com sucesso",
  "data": {
    "usuarios": [...],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 5,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Buscar por ID

```bash
curl http://localhost:3000/users/clxyz...
```

### Atualizar usuário

```bash
curl -X PUT http://localhost:3000/users/clxyz... \
  -H "Content-Type: application/json" \
  -d '{"nome": "Maria Souza", "telefone": "(11) 88888-0001"}'
```

### Remover usuário

```bash
curl -X DELETE http://localhost:3000/users/clxyz...
```

---

## Formato de erros

### Erro de validação (422)

```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": [
    { "campo": "email", "mensagem": "Formato de email inválido" },
    { "campo": "senha", "mensagem": "A senha deve ter pelo menos 6 caracteres" }
  ]
}
```

### Email duplicado (409)

```json
{
  "success": false,
  "message": "Este email já está em uso"
}
```

### Não encontrado (404)

```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

## Variáveis de ambiente

| Variável             | Descrição                                      | Padrão          |
| -------------------- | ---------------------------------------------- | --------------- |
| `DATABASE_URL`       | URL de conexão com o banco                     | `file:./dev.db` |
| `PORT`               | Porta do servidor                              | `3000`          |
| `NODE_ENV`           | Ambiente (`development`, `production`, `test`) | `development`   |
| `BCRYPT_SALT_ROUNDS` | Rounds do bcrypt                               | `10`            |

---

## Evoluindo o projeto

Este projeto foi estruturado para crescer facilmente. Próximos passos naturais:

1. **Autenticação JWT** — adicionar `POST /auth/login` e `POST /auth/refresh`, com middleware `authenticate` na pasta `middlewares/`
2. **Permissões (RBAC)** — adicionar campo `role` no modelo User e middleware `authorize`
3. **Rate limiting** — `express-rate-limit` no `app.js`
4. **PostgreSQL em produção** — alterar `provider` no schema Prisma e ajustar `DATABASE_URL`
5. **Containerização** — `Dockerfile` + `docker-compose.yml`
