/**
 * Tests de integración: Eventos — casos adicionales para subir cobertura
 * Cubre: createEvento, updateEvento, inscribirse, cancelarInscripcion.
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'cs_test' }),
    cancel: jest.fn().mockResolvedValue({}),
  },
  refunds: { create: jest.fn().mockResolvedValue({}) },
}));
jest.mock('../src/utils/socioUtils', () => ({
  obtenernRol: jest.fn(),
  obtenerSocio: jest.fn().mockResolvedValue({ nombre: 'Test', id_socio: 2 }),
}));
jest.mock('../src/utils/comiteUtils', () => ({
  obtenerPresidenteComite: jest.fn(),
  obtenerComiteEvento: jest.fn().mockResolvedValue(1),
  obtenerComitePorSocio: jest.fn().mockResolvedValue(1),
}));
jest.mock('../src/utils/eventoUtils', () => ({
  obtenerMiembrosComiteEvento: jest.fn().mockResolvedValue([]),
  obtenerInscripcionesEvento: jest.fn().mockResolvedValue([]),
  obtenerEvento: jest.fn().mockResolvedValue({ nombre_evento: 'Congreso IA 2026' }),
}));
jest.mock('../src/utils/notificaciones', () => ({
  crearNotificacion: jest.fn().mockResolvedValue({}),
  crearNotificacionEvento: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database');
const { obtenernRol } = require('../src/utils/socioUtils');
const { obtenerPresidenteComite } = require('../src/utils/comiteUtils');
const { tokenAdmin, tokenSocio } = require('./helpers/auth');

const SUSCRIPCION_ACTIVA = {
  rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
  rowCount: 1,
};

const MOCK_EVENTO = {
  id_evento: 1,
  nombre_evento: 'Congreso IA',
  fecha_evento_inicio: new Date(Date.now() + 86400000).toISOString(),
  fecha_evento_fin: new Date(Date.now() + 2 * 86400000).toISOString(),
  descripcion_evento: 'Descripción del evento',
  precio: 50,
  direccion: 1,
  comite: 1,
  slug: 'congreso-ia',
};

// ── POST /eventos-cientificos/crear-evento-cientifico ────────────────────────
describe('POST /eventos-cientificos/crear-evento-cientifico', () => {
  test('401 — sin token', async () => {
    const res = await request(app)
      .post('/eventos-cientificos/crear-evento-cientifico')
      .send({});
    expect(res.status).toBe(401);
  });

  test('400 — faltan datos obligatorios', async () => {
    pool.query.mockResolvedValueOnce(SUSCRIPCION_ACTIVA);

    const res = await request(app)
      .post('/eventos-cientificos/crear-evento-cientifico')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre_evento: 'Solo nombre' });

    expect(res.status).toBe(400);
  });

  test('400 — fecha_fin anterior a fecha_inicio', async () => {
    pool.query.mockResolvedValueOnce(SUSCRIPCION_ACTIVA);
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });

    const hoy = new Date();
    const manana = new Date(hoy.getTime() + 86400000);
    const pasadoManana = new Date(hoy.getTime() + 2 * 86400000);

    const res = await request(app)
      .post('/eventos-cientificos/crear-evento-cientifico')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre_evento: 'Congreso IA',
        fecha_evento_inicio: pasadoManana.toISOString(), // inicio después del fin
        fecha_evento_fin: manana.toISOString(),
        descripcion_evento: 'Desc',
        precio: 50,
        direccion: JSON.stringify({ calle: 'Gran Vía', ciudad: 'Madrid', codigo_postal: '28013', provincia: 'Madrid' }),
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/posterior/i);
  });

  test('200 — admin crea evento con datos válidos', async () => {
    pool.query
      .mockResolvedValueOnce(SUSCRIPCION_ACTIVA)
      .mockResolvedValueOnce({ rows: [{ id_direccion: 5 }], rowCount: 1 }) // INSERT Direccion
      .mockResolvedValueOnce({ rows: [MOCK_EVENTO], rowCount: 1 });          // INSERT Evento

    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });

    const inicio = new Date(Date.now() + 86400000).toISOString();
    const fin = new Date(Date.now() + 2 * 86400000).toISOString();

    const res = await request(app)
      .post('/eventos-cientificos/crear-evento-cientifico')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre_evento: 'Congreso IA',
        fecha_evento_inicio: inicio,
        fecha_evento_fin: fin,
        descripcion_evento: 'Descripción del evento',
        precio: 50,
        direccion: JSON.stringify({ calle: 'Gran Vía', ciudad: 'Madrid', codigo_postal: '28013', provincia: 'Madrid' }),
      });

    expect(res.status).toBe(200);
    expect(res.body.evento.slug).toBe('congreso-ia');
  });
});

// ── PUT /eventos-cientificos/:id ─────────────────────────────────────────────
describe('PUT /eventos-cientificos/:id', () => {
  test('401 — sin token', async () => {
    const res = await request(app).put('/eventos-cientificos/1').send({});
    expect(res.status).toBe(401);
  });

  test('200 — admin puede editar un evento por ID correctamente', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [MOCK_EVENTO], rowCount: 1 }); // UPDATE

    const inicio = new Date(Date.now() + 86400000).toISOString();
    const fin = new Date(Date.now() + 2 * 86400000).toISOString();

    const res = await request(app)
      .put('/eventos-cientificos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre_evento: 'Congreso IA Editado',
        fecha_evento_inicio: inicio,
        fecha_evento_fin: fin,
        descripcion_evento: 'Desc actualizada',
        precio: 60,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/editado/i);
  });

  test('403 — socio no-presidente no puede editar el evento', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });
    obtenerPresidenteComite.mockResolvedValueOnce({ socio: 99 }); // id 99 ≠ tokenSocio (id=2)

    const res = await request(app)
      .put('/eventos-cientificos/1')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({
        nombre_evento: 'Intento de edición',
        fecha_evento_inicio: new Date().toISOString(),
        fecha_evento_fin: new Date(Date.now() + 86400000).toISOString(),
        descripcion_evento: 'Desc',
        precio: 0,
      });

    expect(res.status).toBe(403);
  });
});

// ── POST /eventos-cientificos/:id/inscribirse ────────────────────────────────
describe('POST /eventos-cientificos/:id/inscribirse', () => {
  afterEach(() => pool.query.mockReset());

  test('401 — sin token', async () => {
    const res = await request(app).post('/eventos-cientificos/1/inscribirse').send({});
    expect(res.status).toBe(401);
  });

  test('200 — socio con suscripción activa se inscribe al evento por ID numérico', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }], rowCount: 1 }) // middleware
      .mockResolvedValueOnce({ rows: [{ precio: 50 }], rowCount: 1 })  // SELECT precio
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });                // INSERT inscripcion

    const res = await request(app)
      .post('/eventos-cientificos/1/inscribirse')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clientSecret', 'cs_test');
  });

  test('200 — socio se inscribe al evento por slug', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }], rowCount: 1 }) // middleware
      .mockResolvedValueOnce({ rows: [{ id_evento: 1 }], rowCount: 1 })  // SELECT slug→id
      .mockResolvedValueOnce({ rows: [{ precio: 30 }], rowCount: 1 })    // SELECT precio
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });                  // INSERT inscripcion

    const res = await request(app)
      .post('/eventos-cientificos/congreso-ia/inscribirse')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
  });
});

// ── DELETE /eventos-cientificos/:id/cancelar-inscripcion ─────────────────────
describe('DELETE /eventos-cientificos/:id/cancelar-inscripcion', () => {
  afterEach(() => pool.query.mockReset());

  test('401 — sin token', async () => {
    const res = await request(app).delete('/eventos-cientificos/1/cancelar-inscripcion');
    expect(res.status).toBe(401);
  });

  test('404 — inscripción no encontrada (rowCount=0)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // DELETE RETURNING vacío

    const res = await request(app)
      .delete('/eventos-cientificos/1/cancelar-inscripcion')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(404);
  });

  test('200 — cancela inscripción pagada → Stripe refund', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ payment_intent_id: 'pi_test', estado_inscripcion: 'pagado' }],
      rowCount: 1,
    }); // DELETE RETURNING

    const res = await request(app)
      .delete('/eventos-cientificos/1/cancelar-inscripcion')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cancelada/i);
  });

  test('200 — cancela inscripción pendiente → Stripe paymentIntent.cancel', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ payment_intent_id: 'pi_test', estado_inscripcion: 'pendiente' }],
      rowCount: 1,
    }); // DELETE RETURNING

    const res = await request(app)
      .delete('/eventos-cientificos/1/cancelar-inscripcion')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
  });

  test('200 — cancela inscripción gratuita (sin payment_intent)', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ payment_intent_id: null, estado_inscripcion: 'pagado' }],
      rowCount: 1,
    }); // DELETE RETURNING

    const res = await request(app)
      .delete('/eventos-cientificos/1/cancelar-inscripcion')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
  });
});
