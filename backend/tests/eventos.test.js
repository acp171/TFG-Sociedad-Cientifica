/**
 * Tests de integración: Eventos Científicos
 * Cubre: listado, detalle por ID/slug, creación, eliminación, inscripción, cancelación.
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'secret_test' }),
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

// ── Fixtures ─────────────────────────────────────────────────────────────────
const MOCK_EVENTO = {
  id_evento: 1,
  nombre_evento: 'Congreso Nacional de IA 2026',
  fecha_evento_inicio: '2026-09-10T09:00:00.000Z',
  fecha_evento_fin: '2026-09-12T18:00:00.000Z',
  descripcion_evento: 'El mayor evento de IA de España.',
  precio: 50,
  direccion: 1,
  comite: 1,
  slug: 'congreso-nacional-de-ia-2026',
  calle: 'Gran Vía, 1',
  ciudad: 'Madrid',
  codigo_postal: '28013',
  provincia: 'Madrid',
  extra: null,
  longitud: -3.7,
  latitud: 40.4,
};

// ── GET /listado-eventos-cientificos ─────────────────────────────────────────
describe('GET /listado-eventos-cientificos', () => {
  test('200 — devuelve lista de eventos (ruta pública)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_EVENTO], rowCount: 1 });

    const res = await request(app).get('/listado-eventos-cientificos');

    expect(res.status).toBe(200);
    expect(res.body.eventos.listaEventos).toHaveLength(1);
  });

  test('200 — lista vacía si no hay eventos', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app).get('/listado-eventos-cientificos');

    expect(res.status).toBe(200);
    expect(res.body.eventos.listaEventos).toHaveLength(0);
  });
});

// ── GET /eventos-cientificos/:id ─────────────────────────────────────────────
describe('GET /eventos-cientificos/:id', () => {
  test('200 — obtiene evento por ID numérico', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_EVENTO], rowCount: 1 });

    const res = await request(app).get('/eventos-cientificos/1');

    expect(res.status).toBe(200);
    expect(res.body.evento.id_evento).toBe(1);
    expect(res.body.evento.direccion).toMatchObject({ ciudad: 'Madrid' });
  });

  test('200 — obtiene evento por slug', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_EVENTO], rowCount: 1 });

    const res = await request(app).get('/eventos-cientificos/congreso-nacional-de-ia-2026');

    expect(res.status).toBe(200);
    expect(res.body.evento.nombre_evento).toBe('Congreso Nacional de IA 2026');
  });

  test('404 — evento no encontrado', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app).get('/eventos-cientificos/slug-inexistente');

    expect(res.status).toBe(404);
  });
});

// ── DELETE /eventos-cientificos/:id ─────────────────────────────────────────
describe('DELETE /eventos-cientificos/:id', () => {
  test('401 — sin token', async () => {
    const res = await request(app).delete('/eventos-cientificos/1');
    expect(res.status).toBe(401);
  });

  test('200 — admin puede eliminar un evento', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // DELETE

    const res = await request(app)
      .delete('/eventos-cientificos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });

  test('403 — socio no-presidente no puede eliminar el evento', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });
    obtenerPresidenteComite.mockResolvedValueOnce({ socio: 99 }); // presidente = 99, no el socio (id=2)

    const res = await request(app)
      .delete('/eventos-cientificos/1')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(403);
  });
});

// ── GET /incripciones/listado-incripciones-usuario ───────────────────────────
describe('GET /incripciones/listado-incripciones-usuario', () => {
  test('401 — sin token', async () => {
    const res = await request(app).get('/incripciones/listado-incripciones-usuario');
    expect(res.status).toBe(401);
  });

  test('200 — devuelve inscripciones del socio autenticado', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id_evento: 1, nombre_evento: 'Congreso IA 2026', estado_inscripcion: 'pagado' }],
      rowCount: 1,
    });

    const res = await request(app)
      .get('/incripciones/listado-incripciones-usuario')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body.inscripciones).toHaveLength(1);
  });
});
