/**
 * Tests de integración: Socios — casos adicionales para subir cobertura
 * Cubre: renovarSuscripcion, createSocioByAdmin, corporación (GET/POST/DELETE).
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({ client_secret: 'cs_test' }),
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
const { obtenernRol } = require('../src/utils/socioUtils');
const { tokenAdmin, tokenSocio } = require('./helpers/auth');

// Token especial con tipo=6 (Corporación) para los tests de corporación
const jwt = require('jsonwebtoken');
function tokenCorporacion() {
  return jwt.sign(
    {
      id: 5,
      email: 'corp@test.com',
      nombre: 'Corporacion',
      rol: 8,
      tipo: 6,
      fecha_expiracion: new Date(Date.now() + 86400000).toISOString(),
    },
    process.env.JWT_SECRET || 'test_secret_key_for_jest',
    { expiresIn: '1h' }
  );
}

// ── POST /renovar-suscripcion ─────────────────────────────────────────────────
describe('POST /renovar-suscripcion', () => {
  test('401 — sin token', async () => {
    const res = await request(app).post('/renovar-suscripcion');
    expect(res.status).toBe(401);
  });

  test('404 — socio no encontrado en BD', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post('/renovar-suscripcion')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(404);
  });

  test('200 — socio con cuota=0 renueva sin pago', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ cuota: 0 }], rowCount: 1 }) // SELECT cuota
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });              // UPDATE fecha_expiracion

    const res = await request(app)
      .post('/renovar-suscripcion')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('renovado', true);
  });

  test('200 — socio con cuota>0 obtiene clientSecret de Stripe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ cuota: 20 }], rowCount: 1 });

    const res = await request(app)
      .post('/renovar-suscripcion')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clientSecret', 'cs_test');
    expect(res.body).toHaveProperty('importe', 20);
  });
});

// ── POST /socios/crear-socios ────────────────────────────────────────────────
describe('POST /socios/crear-socios', () => {
  test('401 — sin token', async () => {
    const res = await request(app).post('/socios/crear-socios').send({});
    expect(res.status).toBe(401);
  });

  test('403 — socio normal no puede crear socios', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });

    const res = await request(app)
      .post('/socios/crear-socios')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ nombre: 'Nuevo', apellidos: 'Socio', email: 'nuevo@test.com', password: 'pass123', telefono: '600000001', fecha_nacimiento: '1990-01-01', id_plan: 1 });

    expect(res.status).toBe(403);
  });

  test('201 — admin crea un socio correctamente', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({
      rows: [{ id_socio: 10, nombre: 'Nuevo', email: 'nuevo@test.com' }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/socios/crear-socios')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Nuevo', apellidos: 'Socio', email: 'nuevo@test.com', password: 'pass123', telefono: '600000001', fecha_nacimiento: '1990-01-01', id_plan: 1 });

    expect(res.status).toBe(201);
    expect(res.body.socio.email).toBe('nuevo@test.com');
  });
});

// ── Corporación: GET /corporacion/miembros ───────────────────────────────────
describe('GET /corporacion/miembros', () => {
  test('401 — sin token', async () => {
    const res = await request(app).get('/corporacion/miembros');
    expect(res.status).toBe(401);
  });

  test('403 — socio normal (tipo≠6) no puede ver miembros de corporación', async () => {
    const res = await request(app)
      .get('/corporacion/miembros')
      .set('Authorization', `Bearer ${tokenSocio()}`); // tipo=2

    expect(res.status).toBe(403);
  });

  test('200 — socio corporación obtiene sus miembros', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id_socio: 10, nombre: 'Miembro', email: 'miembro@corp.com' }],
      rowCount: 1,
    });

    const res = await request(app)
      .get('/corporacion/miembros')
      .set('Authorization', `Bearer ${tokenCorporacion()}`);

    expect(res.status).toBe(200);
    expect(res.body.miembros).toHaveLength(1);
  });
});

// ── Corporación: POST /corporacion/miembros ──────────────────────────────────
describe('POST /corporacion/miembros', () => {
  test('403 — socio normal (tipo≠6) no puede añadir miembros', async () => {
    const res = await request(app)
      .post('/corporacion/miembros')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ nombre: 'Miembro', apellidos: 'Corp', email: 'mc@corp.com', password: 'pass123', telefono: '600111222', fecha_nacimiento: '1990-01-01' });

    expect(res.status).toBe(403);
  });

  test('201 — corporación añade un nuevo miembro', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id_socio: 11, nombre: 'Miembro', email: 'mc@corp.com' }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/corporacion/miembros')
      .set('Authorization', `Bearer ${tokenCorporacion()}`)
      .send({ nombre: 'Miembro', apellidos: 'Corp', email: 'mc@corp.com', password: 'pass123', telefono: '600111222', fecha_nacimiento: '1990-01-01' });

    expect(res.status).toBe(201);
    expect(res.body.miembro.email).toBe('mc@corp.com');
  });
});

// ── Corporación: DELETE /corporacion/miembros/:id ────────────────────────────
describe('DELETE /corporacion/miembros/:id', () => {
  test('403 — socio normal no puede eliminar miembros de corporación', async () => {
    const res = await request(app)
      .delete('/corporacion/miembros/10')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(403);
  });

  test('404 — miembro no pertenece a la corporación', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // checkQuery

    const res = await request(app)
      .delete('/corporacion/miembros/999')
      .set('Authorization', `Bearer ${tokenCorporacion()}`);

    expect(res.status).toBe(404);
  });

  test('200 — corporación elimina un miembro correctamente', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id_socio: 10 }], rowCount: 1 }) // checkQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });                  // DELETE

    const res = await request(app)
      .delete('/corporacion/miembros/10')
      .set('Authorization', `Bearer ${tokenCorporacion()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });
});
