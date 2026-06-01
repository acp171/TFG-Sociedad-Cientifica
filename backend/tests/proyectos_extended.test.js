/**
 * Tests de integración: Proyectos — casos adicionales para subir cobertura
 * Cubre: updateProyecto, removeMiembro, validaciones de fechas.
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({}));
jest.mock('../src/utils/socioUtils', () => ({
  obtenernRol: jest.fn(),
}));
jest.mock('../src/utils/proyectoUtils', () => ({
  obtenerNombreProyecto: jest.fn().mockResolvedValue('Detección de sesgos en LLMs'),
  obtenerPresidenteProyecto: jest.fn(),
  obtenerMiembro: jest.fn().mockResolvedValue({ id_socio: 3, nombre: 'Nuevo Miembro', rol: 'Vocal' }),
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

const MOCK_PROYECTO = {
  id_proyecto: 1,
  nombre_proyecto: 'Detección de sesgos en LLMs',
  descripcion: 'Análisis de discriminación en modelos de lenguaje.',
  fecha_inicio: new Date(Date.now() + 86400000 * 2).toISOString(),
  fecha_fin: new Date(Date.now() + 86400000 * 365).toISOString(),
  estado: 'Pendiente',
  slug: 'deteccion-de-sesgos-en-llms',
};

// ── PUT /proyectos-investigacion/:id ─────────────────────────────────────────
describe('PUT /proyectos-investigacion/:id', () => {
  test('401 — sin token', async () => {
    const res = await request(app).put('/proyectos-investigacion/1').send({});
    expect(res.status).toBe(401);
  });

  test('400 — nombre vacío', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });

    const res = await request(app)
      .put('/proyectos-investigacion/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre_proyecto: '', descripcion: 'Desc', fecha_inicio: '2026-01-01', fecha_fin: '2027-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/obligatorio/i);
  });

  test('200 — admin actualiza proyecto', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [MOCK_PROYECTO], rowCount: 1 }); // UPDATE

    const inicio = new Date(Date.now() + 86400000 * 2).toISOString();
    const fin = new Date(Date.now() + 86400000 * 365).toISOString();

    const res = await request(app)
      .put('/proyectos-investigacion/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre_proyecto: 'Proyecto Actualizado', descripcion: 'Nueva desc', fecha_inicio: inicio, fecha_fin: fin });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/actualizado/i);
  });

  test('403 — socio no-presidente no puede editar el proyecto', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });
    obtenerPresidenteProyecto.mockResolvedValueOnce({ socio: 99 }); // id 99 ≠ tokenSocio (id=2)

    const inicio = new Date(Date.now() + 86400000 * 2).toISOString();
    const fin = new Date(Date.now() + 86400000 * 365).toISOString();

    const res = await request(app)
      .put('/proyectos-investigacion/1')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ nombre_proyecto: 'Intento de edición', descripcion: 'Desc', fecha_inicio: inicio, fecha_fin: fin });

    expect(res.status).toBe(403);
  });

  test('200 — presidente puede actualizar su proyecto por slug', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });
    obtenerPresidenteProyecto.mockResolvedValueOnce({ socio: 2 }); // id=2 es tokenSocio
    pool.query
      .mockResolvedValueOnce({ rows: [{ id_proyecto: 1 }], rowCount: 1 }) // SELECT slug→id
      .mockResolvedValueOnce({ rows: [MOCK_PROYECTO], rowCount: 1 });      // UPDATE

    const inicio = new Date(Date.now() + 86400000 * 2).toISOString();
    const fin = new Date(Date.now() + 86400000 * 365).toISOString();

    const res = await request(app)
      .put('/proyectos-investigacion/deteccion-de-sesgos-en-llms')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ nombre_proyecto: 'Proyecto Actualizado', descripcion: 'Desc', fecha_inicio: inicio, fecha_fin: fin });

    expect(res.status).toBe(200);
  });
});

// ── DELETE /proyectos-investigacion/:id/miembros/:id_socio ───────────────────
describe('DELETE /proyectos-investigacion/:id/miembros/:id_socio', () => {
  test('401 — sin token', async () => {
    const res = await request(app).delete('/proyectos-investigacion/1/miembros/3');
    expect(res.status).toBe(401);
  });

  test('200 — admin puede expulsar a un miembro del proyecto', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // DELETE

    const res = await request(app)
      .delete('/proyectos-investigacion/1/miembros/3')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/expulsado/i);
  });

  test('403 — socio no-presidente no puede expulsar a un miembro', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });
    obtenerPresidenteProyecto.mockResolvedValueOnce({ socio: 99 }); // id 99 ≠ tokenSocio (id=2)

    const res = await request(app)
      .delete('/proyectos-investigacion/1/miembros/3')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(403);
  });

  test('200 — presidente puede expulsar a un miembro de su proyecto por slug', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });
    obtenerPresidenteProyecto.mockResolvedValueOnce({ socio: 2 }); // id=2 es tokenSocio
    pool.query
      .mockResolvedValueOnce({ rows: [{ id_proyecto: 1 }], rowCount: 1 }) // SELECT slug→id
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });                    // DELETE

    const res = await request(app)
      .delete('/proyectos-investigacion/deteccion-de-sesgos-en-llms/miembros/3')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
  });
});

// ── Validaciones de createProyecto ───────────────────────────────────────────
describe('POST /proyectos-investigacion/crear-proyecto-investigacion — validaciones', () => {
  test('400 — fecha_inicio en el pasado', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
      rowCount: 1,
    });

    const fechaInicioEnPasado = new Date(Date.now() - 86400000).toISOString(); // ayer
    const fechaFin = new Date(Date.now() + 86400000 * 365).toISOString();

    const res = await request(app)
      .post('/proyectos-investigacion/crear-proyecto-investigacion')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ nombre_proyecto: 'Proyecto', descripcion: 'Desc', fecha_inicio: fechaInicioEnPasado, fecha_fin: fechaFin });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/fecha/i);
  });

  test('403 — fecha_fin anterior a fecha_inicio', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
      rowCount: 1,
    });

    const fechaInicio = new Date(Date.now() + 86400000 * 5).toISOString();
    const fechaFinAntes = new Date(Date.now() + 86400000 * 2).toISOString(); // antes del inicio

    const res = await request(app)
      .post('/proyectos-investigacion/crear-proyecto-investigacion')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ nombre_proyecto: 'Proyecto', descripcion: 'Desc', fecha_inicio: fechaInicio, fecha_fin: fechaFinAntes });

    expect(res.status).toBe(403); // fecha fin inválida
    expect(res.body.message).toMatch(/fecha fin/i);
  });
});
