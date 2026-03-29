require('dotenv').config();
process.env.NODE_ENV = 'test';
// Usa um banco separado para os testes
process.env.DATABASE_URL = 'file:./test.db';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/database/prisma');

// ─── Setup e teardown ────────────────────────────────────────────────────────

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  // Limpa a tabela antes de cada teste para garantir isolamento
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const criarUsuario = (overrides = {}) => ({
  nome: 'João Teste',
  email: 'joao@teste.com',
  senha: 'senha123',
  telefone: '(11) 98765-4321',
  ...overrides,
});

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('POST /users — Criar usuário', () => {
  it('deve criar um usuário com dados válidos', async () => {
    const res = await request(app).post('/users').send(criarUsuario());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.usuario).toMatchObject({
      nome: 'João Teste',
      email: 'joao@teste.com',
    });
    // Senha nunca deve aparecer na resposta
    expect(res.body.data.usuario.senha).toBeUndefined();
  });

  it('deve retornar 422 quando o email for inválido', async () => {
    const res = await request(app)
      .post('/users')
      .send(criarUsuario({ email: 'email-invalido' }));

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('deve retornar 422 quando a senha for curta demais', async () => {
    const res = await request(app)
      .post('/users')
      .send(criarUsuario({ senha: '123' }));

    expect(res.status).toBe(422);
  });

  it('deve retornar 422 quando campos obrigatórios faltarem', async () => {
    const res = await request(app).post('/users').send({ nome: 'Só Nome' });

    expect(res.status).toBe(422);
  });

  it('deve retornar 409 quando o email já estiver em uso', async () => {
    await request(app).post('/users').send(criarUsuario());
    const res = await request(app).post('/users').send(criarUsuario());

    expect(res.status).toBe(409);
  });
});

describe('GET /users — Listar usuários', () => {
  beforeEach(async () => {
    await request(app).post('/users').send(criarUsuario({ email: 'a@teste.com', nome: 'Alice' }));
    await request(app).post('/users').send(criarUsuario({ email: 'b@teste.com', nome: 'Bob' }));
    await request(app).post('/users').send(criarUsuario({ email: 'c@teste.com', nome: 'Carlos' }));
  });

  it('deve listar todos os usuários com paginação', async () => {
    const res = await request(app).get('/users');

    expect(res.status).toBe(200);
    expect(res.body.data.usuarios).toHaveLength(3);
    expect(res.body.data.pagination).toMatchObject({
      total: 3,
      page: 1,
    });
  });

  it('deve paginar corretamente', async () => {
    const res = await request(app).get('/users?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data.usuarios).toHaveLength(2);
    expect(res.body.data.pagination.totalPages).toBe(2);
    expect(res.body.data.pagination.hasNextPage).toBe(true);
  });

  it('deve filtrar por nome', async () => {
    const res = await request(app).get('/users?nome=alice');

    expect(res.status).toBe(200);
    expect(res.body.data.usuarios).toHaveLength(1);
    expect(res.body.data.usuarios[0].nome).toBe('Alice');
  });

  it('deve filtrar por email', async () => {
    const res = await request(app).get('/users?email=b@teste');

    expect(res.status).toBe(200);
    expect(res.body.data.usuarios).toHaveLength(1);
  });
});

describe('GET /users/:id — Buscar por ID', () => {
  it('deve retornar o usuário pelo ID', async () => {
    const criado = await request(app).post('/users').send(criarUsuario());
    const id = criado.body.data.usuario.id;

    const res = await request(app).get(`/users/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.usuario.id).toBe(id);
  });

  it('deve retornar 404 para ID inexistente', async () => {
    const res = await request(app).get('/users/id-inexistente');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /users/:id — Atualizar usuário', () => {
  it('deve atualizar os campos informados', async () => {
    const criado = await request(app).post('/users').send(criarUsuario());
    const id = criado.body.data.usuario.id;

    const res = await request(app)
      .put(`/users/${id}`)
      .send({ nome: 'Nome Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body.data.usuario.nome).toBe('Nome Atualizado');
    expect(res.body.data.usuario.email).toBe('joao@teste.com'); // email inalterado
  });

  it('deve retornar 404 ao atualizar usuário inexistente', async () => {
    const res = await request(app)
      .put('/users/id-inexistente')
      .send({ nome: 'Novo Nome' });

    expect(res.status).toBe(404);
  });

  it('deve retornar 409 ao tentar usar um email já existente', async () => {
    await request(app)
      .post('/users')
      .send(criarUsuario({ email: 'outro@teste.com', nome: 'Outro' }));

    const criado = await request(app).post('/users').send(criarUsuario());
    const id = criado.body.data.usuario.id;

    const res = await request(app)
      .put(`/users/${id}`)
      .send({ email: 'outro@teste.com' });

    expect(res.status).toBe(409);
  });

  it('deve retornar 422 quando o body estiver vazio', async () => {
    const criado = await request(app).post('/users').send(criarUsuario());
    const id = criado.body.data.usuario.id;

    const res = await request(app).put(`/users/${id}`).send({});

    expect(res.status).toBe(422);
  });
});

describe('DELETE /users/:id — Remover usuário', () => {
  it('deve remover o usuário', async () => {
    const criado = await request(app).post('/users').send(criarUsuario());
    const id = criado.body.data.usuario.id;

    const res = await request(app).delete(`/users/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Confirma que foi removido
    const busca = await request(app).get(`/users/${id}`);
    expect(busca.status).toBe(404);
  });

  it('deve retornar 404 ao remover usuário inexistente', async () => {
    const res = await request(app).delete('/users/id-inexistente');

    expect(res.status).toBe(404);
  });
});

describe('GET /health — Health check', () => {
  it('deve retornar status 200', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
