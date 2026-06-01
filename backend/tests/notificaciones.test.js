/**
 * Tests de integración: Notificaciones
 * Cubre: envío a socios, contacto, listados y marcar como leída.
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({}));
jest.mock('../src/utils/socioUtils', () => ({
  obtenernRol: jest.fn(),
}));
jest.mock('../src/utils/notificaciones', () => ({
  crearNotificacion: jest.fn().mockResolvedValue({}),
  crearNotificacionSocio: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database');
const { obtenernRol } = require('../src/utils/socioUtils');
const { tokenAdmin, tokenSocio } = require('./helpers/auth');

const MOCK_NOTIFICACION = {
  id_notificacion: 1,
  socio: 2,
  titulo: 'Bienvenido',
  mensaje: 'Gracias por registrarte.',
  fecha_envio: new Date().toISOString(),
  estado_lectura: false,
};

describe('GET /listado-notificacion-usuario', () => {
  test('200 — obtiene notificaciones del usuario logueado', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_NOTIFICACION], rowCount: 1 });

    const res = await request(app)
      .get('/listado-notificacion-usuario')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body.notificaciones.listadoNotificaciones).toHaveLength(1);
  });
});

describe('GET /listado-notificacion-usuario-sin-leer', () => {
  test('200 — obtiene notificaciones sin leer', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_NOTIFICACION], rowCount: 1 });

    const res = await request(app)
      .get('/listado-notificacion-usuario-sin-leer')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body.notificaciones.listadoNotificaciones).toHaveLength(1);
  });
});

describe('GET /listado-notificaciones (todas — admin)', () => {
  test('200 — admin obtiene todas las notificaciones', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [MOCK_NOTIFICACION], rowCount: 1 });

    const res = await request(app)
      .get('/listado-notificaciones')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.notificaciones.listadoNotificaciones).toHaveLength(1);
  });

  test('403 — socio normal no puede ver todas las notificaciones', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });

    const res = await request(app)
      .get('/listado-notificaciones')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(403);
  });
});

describe('POST /notificacion-usuario (admin envía a socio)', () => {
  test('200 — admin envía notificación', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });

    const res = await request(app)
      .post('/notificacion-usuario')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ id_socio: 2, titulo: 'Alerta', notificacion: 'Mensaje' });

    expect(res.status).toBe(200);
  });

  test('400 — faltan parámetros', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });

    const res = await request(app)
      .post('/notificacion-usuario')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ id_socio: 2 }); // faltan titulo y notificacion

    expect(res.status).toBe(400);
  });
});

describe('POST /notificacion-contacto', () => {
  test('200 — envía notificación de contacto', async () => {
    const res = await request(app)
      .post('/notificacion-contacto')
      .set('Authorization', `Bearer ${tokenSocio()}`) // email = socio@test.com
      .send({ email: 'socio@test.com', titulo: 'Contacto', mensaje: 'Mensaje' });

    expect(res.status).toBe(200);
  });

  test('403 — email del body no coincide con el del token', async () => {
    const res = await request(app)
      .post('/notificacion-contacto')
      .set('Authorization', `Bearer ${tokenSocio()}`) // email = socio@test.com
      .send({ email: 'otro@test.com', titulo: 'Contacto', mensaje: 'Mensaje' });

    expect(res.status).toBe(403);
  });
});

describe('PATCH /notificaciones/:id/leida', () => {
  test('200 — marca como leída', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app).patch('/notificaciones/1/leida');

    expect(res.status).toBe(200);
  });
});
