/**
 * Tests de integración: Proyectos de Investigación
 * Cubre: listado, detalle por ID/slug, creación, eliminación, gestión de miembros.
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({}));
jest.mock('../src/utils/socioUtils', () => ({
  obtenernRol: jest.fn(),
}));
jest.mock('../src/utils/proyectoUtils', () => ({
  obtenerNombreProyecto: jest.fn().mockResolvedValue('Detección de sesgos en LLMs'),
  obtenerPresidenteProyecto: jest.fn(),
  obtenerMiembro: jest.fn().mockResolvedValue({ id_socio: 2, nombre: 'Socio', rol: 'Presidente' }),
}));
jest.mock('../src/utils/notificaciones', () => ({
  crearNotificacion: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database');
const { obtenernRol } = require('../src/utils/socioUtils');
const { obtenerPresidenteProyecto } = require('../src/utils/proyectoUtils');
const { tokenAdmin, tokenSocio } = require('./helpers/auth');

// ── Fixtures ─────────────────────────────────────────────────────────────────
const MOCK_PROYECTO = {
  id_proyecto: 1,
  nombre_proyecto: 'Detección de sesgos en LLMs',
  descripcion: 'Análisis de discriminación en modelos de lenguaje.',
  fecha_inicio: '2025-01-01T00:00:00.000Z',
  fecha_fin: '2026-01-01T00:00:00.000Z',
  estado: 'activo',
  slug: 'deteccion-de-sesgos-en-llms',
};

const MOCK_MIEMBRO = {
  id_socio: 2,
  nombre: 'Socio',
  apellidos: 'Test',
  rol: 'Presidente',
  fecha_registro: new Date().toISOString(),
};

// ── GET /listado-proyectos-investigacion ─────────────────────────────────────
describe('GET /listado-proyectos-investigacion', () => {
  test('200 — devuelve lista de proyectos (ruta pública)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_PROYECTO], rowCount: 1 });

    const res = await request(app).get('/listado-proyectos-investigacion');

    expect(res.status).toBe(200);
    expect(res.body.proyectos.listaProyectos).toHaveLength(1);
    expect(res.body.proyectos.listaProyectos[0].slug).toBe('deteccion-de-sesgos-en-llms');
  });

  test('200 — lista vacía si no hay proyectos', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app).get('/listado-proyectos-investigacion');

    expect(res.status).toBe(200);
    expect(res.body.proyectos.listaProyectos).toHaveLength(0);
  });
});

// ── GET /proyectos-investigacion/:id ─────────────────────────────────────────
describe('GET /proyectos-investigacion/:id', () => {
  test('200 — obtiene proyecto por ID numérico con miembros', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [MOCK_PROYECTO], rowCount: 1 }) // SELECT proyecto
      .mockResolvedValueOnce({ rows: [MOCK_MIEMBRO], rowCount: 1 }); // SELECT miembros

    const res = await request(app).get('/proyectos-investigacion/1');

    expect(res.status).toBe(200);
    expect(res.body.proyecto.id_proyecto).toBe(1);
    expect(res.body.miembros).toHaveLength(1);
  });

  test('200 — obtiene proyecto por slug', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [MOCK_PROYECTO], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app).get('/proyectos-investigacion/deteccion-de-sesgos-en-llms');

    expect(res.status).toBe(200);
    expect(res.body.proyecto.nombre_proyecto).toBe('Detección de sesgos en LLMs');
  });

  test('404 — proyecto no encontrado', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app).get('/proyectos-investigacion/slug-inexistente');

    expect(res.status).toBe(404);
  });
});

// ── POST /proyectos-investigacion/crear-proyecto-investigacion ───────────────
describe('POST /proyectos-investigacion/crear-proyecto-investigacion', () => {
  test('401 — sin token', async () => {
    const res = await request(app)
      .post('/proyectos-investigacion/crear-proyecto-investigacion')
      .send({ nombre_proyecto: 'Test', descripcion: 'Desc', fecha_fin: '2027-01-01' });

    expect(res.status).toBe(401);
  });

  test('400 — faltan datos obligatorios', async () => {
    // El middleware verificarSuscripcionActiva permite pasar (suscripción activa)
    pool.query.mockResolvedValueOnce({
      rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/proyectos-investigacion/crear-proyecto-investigacion')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({}); // sin datos

    expect(res.status).toBe(400);
  });

  test('200 — crea proyecto con datos válidos', async () => {
    const fechaInicio = new Date(Date.now() + 86400000 * 2).toISOString(); // mañana+1
    const fechaFin = new Date(Date.now() + 86400000 * 365).toISOString(); // en 1 año

    pool.query
      .mockResolvedValueOnce({
        rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
        rowCount: 1,
      }) // suscripción activa
      .mockResolvedValueOnce({ rows: [MOCK_PROYECTO], rowCount: 1 }) // INSERT proyecto
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });              // INSERT miembro

    const res = await request(app)
      .post('/proyectos-investigacion/crear-proyecto-investigacion')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({
        nombre_proyecto: 'Detección de sesgos en LLMs',
        descripcion: 'Análisis de discriminación en modelos de lenguaje.',
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });

    expect(res.status).toBe(200);
    expect(res.body.proyecto.slug).toBe('deteccion-de-sesgos-en-llms');
  });
});

// ── DELETE /proyectos-investigacion/:id ──────────────────────────────────────
describe('DELETE /proyectos-investigacion/:id', () => {
  test('401 — sin token', async () => {
    const res = await request(app).delete('/proyectos-investigacion/1');
    expect(res.status).toBe(401);
  });

  test('200 — admin puede eliminar un proyecto', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // DELETE

    const res = await request(app)
      .delete('/proyectos-investigacion/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });

  test('403 — socio no-presidente no puede eliminar el proyecto', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });
    obtenerPresidenteProyecto.mockResolvedValueOnce({ socio: 99 }); // presidente ≠ tokenSocio(id=2)

    const res = await request(app)
      .delete('/proyectos-investigacion/1')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(403);
  });
});

// ── POST /proyectos-investigacion/:id/miembros ───────────────────────────────
describe('POST /proyectos-investigacion/:id/miembros', () => {
  test('401 — sin token', async () => {
    const res = await request(app)
      .post('/proyectos-investigacion/1/miembros')
      .send({ socio: 3, rol_proyecto: 7 });

    expect(res.status).toBe(401);
  });

  test('400 — faltan datos (socio o rol)', async () => {
    const res = await request(app)
      .post('/proyectos-investigacion/1/miembros')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test('200 — admin añade un miembro al proyecto', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // INSERT miembro

    const res = await request(app)
      .post('/proyectos-investigacion/1/miembros')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ socio: 3, rol_proyecto: 7 });

    expect(res.status).toBe(200);
    expect(res.body.miembro).toBeDefined();
  });
});
