/**
 * Tests de integración: Autenticación (login, forgot/reset password)
 * - BD mockeada (sin conexión real a Neon DB)
 * - Stripe mockeado (sin cargos reales)
 * - SendGrid mockeado (sin emails reales)
 * - bcrypt mockeado (tests rápidos)
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({
  paymentIntents: { create: jest.fn() },
}));
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }, {}]),
}));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('$2a$10$hashed'),
}));

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database');
const bcrypt = require('bcrypt');

// Hash conocido de 'password123' para simular una respuesta de BD real
const FAKE_HASH = '$2a$10$hashed';

const MOCK_SOCIO = {
  id_socio: 1,
  nombre: 'Test',
  apellidos: 'User',
  email: 'test@test.com',
  password: FAKE_HASH,
  socio_rol: 1,
  tipo_socio: 1,
  fecha_expiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  plan_nombre: 'Socio',
  cuota: 20,
};

describe('POST /login', () => {
  test('200 — credenciales correctas devuelve token y datos del socio', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_SOCIO], rowCount: 1 });
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.socio).toHaveProperty('email', 'test@test.com');
  });

  test('401 — contraseña incorrecta', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_SOCIO], rowCount: 1 });
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/inválidas/i);
  });

  test('401 — email no registrado en BD', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post('/login')
      .send({ email: 'noexiste@test.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  test('400 — faltan email y contraseña en el body', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.status).toBe(400);
  });

  test('400 — falta solo la contraseña', async () => {
    const res = await request(app).post('/login').send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/forgot-password', () => {
  test('200 — email existente (no revela si existe o no)', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id_socio: 1, email: 'test@test.com' }],
      rowCount: 1,
    });
    // mock INSERT del token de reset
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/si existe/i);
  });

  test('200 — email inexistente (respuesta idéntica por seguridad)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'noexiste@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/si existe/i);
  });
});

describe('POST /auth/reset-password', () => {
  test('400 — faltan token o contraseña', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'abc' }); // falta password

    expect(res.status).toBe(400);
  });

  test('400 — token inválido (no existe en BD)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'token-invalido', password: 'nuevapassword123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/inválido/i);
  });

  test('400 — contraseña menor de 8 caracteres', async () => {
    const tokenRow = {
      id: 1,
      socio: 1,
      token_hash: 'hash',
      usado: false,
      expires_at: new Date(Date.now() + 60000),
    };
    pool.query.mockResolvedValueOnce({ rows: [tokenRow], rowCount: 1 });

    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'validtoken', password: 'corta' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8 caracteres/i);
  });

  test('200 — token válido y contraseña correcta', async () => {
    const tokenRow = {
      id: 1,
      socio: 1,
      token_hash: 'hash',
      usado: false,
      expires_at: new Date(Date.now() + 60000),
    };
    pool.query
      .mockResolvedValueOnce({ rows: [tokenRow], rowCount: 1 }) // SELECT token
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })          // UPDATE password
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });         // UPDATE token usado

    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'validtoken', password: 'nuevapassword123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/actualizada/i);
  });
});
