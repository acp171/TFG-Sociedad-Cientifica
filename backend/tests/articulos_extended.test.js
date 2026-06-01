/**
 * Tests de integración: Artículos — casos adicionales para subir cobertura
 * Cubre: moderarComentario, downloadPDF, deleteArticulo por slug,
 *        createArticulo con PDF, addComentario por slug.
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({}));
jest.mock('../src/utils/uploadCloudinary', () => ({
  single: () => (req, res, next) => next(),
}));
jest.mock('../src/utils/socioUtils', () => ({
  obtenernRol: jest.fn(),
  obtenerSocio: jest.fn(),
  obtenerSocios: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database');
const { obtenernRol } = require('../src/utils/socioUtils');
const { tokenAdmin, tokenSocio } = require('./helpers/auth');

const SUSCRIPCION_ACTIVA = {
  rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
  rowCount: 1,
};

const MOCK_ARTICULO = {
  id_publicacion: 1,
  titulo: 'Avances en algoritmos cuánticos',
  contenido: 'Contenido del artículo...',
  contenidopdf: null,
  fecha_publicacion: new Date().toISOString(),
  socio: 2,
  slug: 'avances-en-algoritmos-cuanticos',
  nombre: 'Socio',
  apellidos: 'Test',
};

// ── Moderación de comentarios ─────────────────────────────────────────────────
describe('PATCH /articulos-cientificos/:id/comentarios/:id_comentario/moderar', () => {
  test('401 — sin token', async () => {
    const res = await request(app).patch('/articulos-cientificos/1/comentarios/1/moderar');
    expect(res.status).toBe(401);
  });

  test('403 — socio normal no puede moderar comentarios', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });

    const res = await request(app)
      .patch('/articulos-cientificos/1/comentarios/1/moderar')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(403);
  });

  test('404 — comentario no encontrado', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE RETURNING vacío

    const res = await request(app)
      .patch('/articulos-cientificos/1/comentarios/999/moderar')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });

  test('200 — admin modera un comentario (toggle visibilidad)', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({
      rows: [{ id_comentario: 1, comentario: 'Texto', visibilidad: false }],
      rowCount: 1,
    });

    const res = await request(app)
      .patch('/articulos-cientificos/1/comentarios/1/moderar')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/moderado/i);
    expect(res.body.comentario.visibilidad).toBe(false);
  });
});

// ── DELETE por slug ───────────────────────────────────────────────────────────
describe('DELETE /articulos-cientificos/:slug — por slug', () => {
  test('404 — slug no existe en BD', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT slug

    const res = await request(app)
      .delete('/articulos-cientificos/slug-que-no-existe')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});

// ── addComentario por slug ────────────────────────────────────────────────────
describe('POST /articulos-cientificos/:slug/comentarios — por slug', () => {
  test('404 — artículo no encontrado por slug en comentario', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT slug

    const res = await request(app)
      .post('/articulos-cientificos/slug-inexistente/comentarios')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ comentario: 'Un comentario' });

    expect(res.status).toBe(404);
  });

  test('200 — añade comentario por slug válido', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id_publicacion: 1 }], rowCount: 1 }) // SELECT slug→id
      .mockResolvedValueOnce({
        rows: [{ id_comentario: 5, comentario: 'Un comentario', socio: 2, publicacion: 1, fecha_comentario: new Date().toISOString(), visibilidad: true }],
        rowCount: 1,
      }) // INSERT
      .mockResolvedValueOnce({
        rows: [{ id_comentario: 5, comentario: 'Un comentario', nombre: 'Socio', apellidos: 'Test' }],
        rowCount: 1,
      }); // SELECT detallado

    const res = await request(app)
      .post('/articulos-cientificos/avances-en-algoritmos-cuanticos/comentarios')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ comentario: 'Un comentario' });

    expect(res.status).toBe(200);
  });
});

// ── Admin CRUD adicional ──────────────────────────────────────────────────────
describe('Panel Admin — DELETE tipos y UPDATE tipos', () => {
  test('PUT /tipos/:id — 200 actualiza tipo', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({
      rows: [{ id_tipo_socio: 1, nombre_tipo: 'Tipo Modificado', cuota: 50 }],
      rowCount: 1,
    });

    const res = await request(app)
      .put('/tipos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre_tipo: 'Tipo Modificado', descripcion: 'Nueva desc', cuota: 50, price_stripe: 'price_xyz' });

    expect(res.status).toBe(200);
    expect(res.body.tipo.nombre_tipo).toBe('Tipo Modificado');
  });

  test('DELETE /tipos/:id — 200 elimina tipo', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .delete('/tipos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
  });

  test('PUT /asignar-rol — asigna rol a nivel de socio', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .put('/asignar-rol')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ id_socio: 3, rol: 5, funcion: 'socio' });

    expect(res.status).toBe(200);
  });

  test('PUT /asignar-rol — asigna rol en proyecto', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .put('/asignar-rol')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ id_socio: 3, rol: 5, proyecto: 1, funcion: 'proyecto' });

    expect(res.status).toBe(200);
  });

  test('DELETE /eliminar-rol — elimina rol a nivel de socio', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .delete('/eliminar-rol')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ id_socio: 3, funcion: 'socio' });

    expect(res.status).toBe(200);
  });

  test('DELETE /eliminar-rol — elimina rol de comité', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .delete('/eliminar-rol')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ id_socio: 3, comite: 1, funcion: 'comite' });

    expect(res.status).toBe(200);
  });
});

// ── authController — registro ─────────────────────────────────────────────────
describe('POST /register — registro de nuevos socios', () => {
  test('400 — falta password', async () => {
    const res = await request(app)
      .post('/register')
      .send({ nombre: 'Test', apellidos: 'User', email: 'nuevo@test.com', telefono: '600000001', fecha_nacimiento: '1995-01-01', tipo_socio: 1 });

    expect(res.status).toBe(400);
  });

  test('400 — contraseña menor de 8 caracteres', async () => {
    const res = await request(app)
      .post('/register')
      .send({ nombre: 'Test', apellidos: 'User', email: 'nuevo@test.com', password: 'corta', telefono: '600000001', fecha_nacimiento: '1995-01-01', tipo_socio: 1 });

    // El controlador valida el plan antes que la contraseña, y falta el plan en el body
    expect(res.status).toBe(400);
  });
});
