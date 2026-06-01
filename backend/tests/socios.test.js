/**
 * Tests de integración: Gestión de Socios y Perfil
 * Cubre: perfil (GET/PATCH), lista de socios (admin), corporación.
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({ client_secret: 'secret_test' }),
  },
}));
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('$2a$10$hashed'),
}));
jest.mock('../src/utils/socioUtils', () => ({
  obtenernRol: jest.fn(),
  obtenerSocio: jest.fn(),
  obtenerSocios: jest.fn(),
}));
jest.mock('../src/utils/notificaciones', () => ({
  crearNotificacion: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database');
const { obtenernRol, obtenerSocios } = require('../src/utils/socioUtils');
const { tokenAdmin, tokenSocio } = require('./helpers/auth');

// ── Fixtures ─────────────────────────────────────────────────────────────────
const MOCK_PERFIL = {
  nombre: 'Socio',
  apellidos: 'Test',
  email: 'socio@test.com',
  telefono: '600000000',
  fecha_nacimiento: '1995-01-01T00:00:00.000Z',
  fecha_alta: new Date().toISOString(),
  socio_rol: 'Socio',
  tipo_socio: 'Estudiante',
};

// ── GET /perfil ───────────────────────────────────────────────────────────────
describe('GET /perfil', () => {
  test('401 — sin token', async () => {
    const res = await request(app).get('/perfil');
    expect(res.status).toBe(401);
  });

  test('200 — socio autenticado obtiene su perfil', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_PERFIL], rowCount: 1 });

    const res = await request(app)
      .get('/perfil')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body.socio.email).toBe('socio@test.com');
    expect(res.body.socio.socio_rol).toBe('Socio');
  });

  test('404 — usuario inexistente en BD', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get('/perfil')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(404);
  });
});

// ── PATCH /perfil ─────────────────────────────────────────────────────────────
describe('PATCH /perfil', () => {
  test('401 — sin token', async () => {
    const res = await request(app).patch('/perfil').send({ nombre: 'Nuevo' });
    expect(res.status).toBe(401);
  });

  test('400 — campos obligatorios vacíos', async () => {
    const res = await request(app)
      .patch('/perfil')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({}); // sin nombre, apellidos, telefono

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/obligatorios/i);
  });

  test('200 — actualiza perfil con datos válidos', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })           // UPDATE
      .mockResolvedValueOnce({ rows: [MOCK_PERFIL], rowCount: 1 }); // SELECT actualizado

    const res = await request(app)
      .patch('/perfil')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ nombre: 'Socio', apellidos: 'Test', telefono: '600000000' });

    expect(res.status).toBe(200);
    expect(res.body.socio.nombre).toBe('Socio');
  });
});

// ── GET /socios/listado-socios ────────────────────────────────────────────────
describe('GET /socios/listado-socios', () => {
  test('401 — sin token', async () => {
    const res = await request(app).get('/socios/listado-socios');
    expect(res.status).toBe(401);
  });

  test('403 — socio normal no puede listar socios', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });

    const res = await request(app)
      .get('/socios/listado-socios')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(403);
  });

  test('200 — admin obtiene la lista completa de socios', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    obtenerSocios.mockResolvedValueOnce([MOCK_PERFIL]);

    const res = await request(app)
      .get('/socios/listado-socios')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.socios.listaSocios).toHaveLength(1);
  });
});

// ── DELETE /perfil ────────────────────────────────────────────────────────────
describe('DELETE /perfil', () => {
  test('401 — sin token', async () => {
    const res = await request(app).delete('/perfil');
    expect(res.status).toBe(401);
  });

  test('200 — socio autenticado elimina su cuenta', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // DELETE

    const res = await request(app)
      .delete('/perfil')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminada/i);
  });
});
