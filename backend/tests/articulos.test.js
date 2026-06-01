/**
 * Tests de integración: Artículos Científicos
 * Cubre: listado, detalle por ID/slug, creación, eliminación, comentarios y moderación.
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({}));
jest.mock('../src/utils/uploadCloudinary', () => ({
  single: () => (req, res, next) => next(), // bypass multer/cloudinary
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

// ── Fixtures ────────────────────────────────────────────────────────────────
const MOCK_ARTICULO = {
  id_publicacion: 1,
  titulo: 'Avances en algoritmos cuánticos',
  contenido: 'Contenido del artículo...',
  contenidopdf: null,
  fecha_publicacion: new Date().toISOString(),
  socio: 1,
  slug: 'avances-en-algoritmos-cuanticos',
  nombre: 'Admin',
  apellidos: 'Test',
};

const MOCK_COMENTARIO = {
  id_comentario: 1,
  comentario: 'Muy interesante.',
  socio: 2,
  publicacion: 1,
  fecha_comentario: new Date().toISOString(),
  visibilidad: true,
  nombre: 'Socio',
  apellidos: 'Test',
};

// ── GET /listado-articulos-cientificos ───────────────────────────────────────
describe('GET /listado-articulos-cientificos', () => {
  test('200 — devuelve la lista de artículos (ruta pública)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_ARTICULO], rowCount: 1 });

    const res = await request(app).get('/listado-articulos-cientificos');

    expect(res.status).toBe(200);
    expect(res.body.articulos.listadoArticulos).toHaveLength(1);
    expect(res.body.articulos.listadoArticulos[0].slug).toBe('avances-en-algoritmos-cuanticos');
  });

  test('200 — devuelve lista vacía si no hay artículos', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app).get('/listado-articulos-cientificos');

    expect(res.status).toBe(200);
    expect(res.body.articulos.listadoArticulos).toHaveLength(0);
  });
});

// ── GET /articulos-cientificos/:id ───────────────────────────────────────────
describe('GET /articulos-cientificos/:id', () => {
  test('200 — obtiene artículo por ID numérico', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [MOCK_ARTICULO], rowCount: 1 }) // SELECT artículo
      .mockResolvedValueOnce({ rows: [MOCK_COMENTARIO], rowCount: 1 }); // SELECT comentarios

    const res = await request(app).get('/articulos-cientificos/1');

    expect(res.status).toBe(200);
    expect(res.body.articulo.id_publicacion).toBe(1);
    expect(res.body.comentarios).toHaveLength(1);
  });

  test('200 — obtiene artículo por slug', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [MOCK_ARTICULO], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app).get('/articulos-cientificos/avances-en-algoritmos-cuanticos');

    expect(res.status).toBe(200);
    expect(res.body.articulo.titulo).toBe('Avances en algoritmos cuánticos');
  });

  test('404 — artículo no encontrado', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app).get('/articulos-cientificos/slug-inexistente');

    expect(res.status).toBe(404);
  });
});

// ── POST /articulos-cientificos/publicar-articulo-cientifico ────────────────
describe('POST /articulos-cientificos/publicar-articulo-cientifico', () => {
  test('401 — sin token devuelve 401', async () => {
    const res = await request(app)
      .post('/articulos-cientificos/publicar-articulo-cientifico')
      .send({ titulo: 'Test', contenido: 'Body...' });

    expect(res.status).toBe(401);
  });

  test('200 — socio autenticado crea artículo con contenido texto', async () => {
    // verificarSuscripcionActiva: consulta fecha_expiracion
    pool.query
      .mockResolvedValueOnce({
        rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
        rowCount: 1,
      })
      // INSERT artículo
      .mockResolvedValueOnce({ rows: [MOCK_ARTICULO], rowCount: 1 });

    const res = await request(app)
      .post('/articulos-cientificos/publicar-articulo-cientifico')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ titulo: 'Avances en algoritmos cuánticos', contenido: 'Contenido del artículo...' });

    expect(res.status).toBe(200);
    expect(res.body.publicacion.slug).toBe('avances-en-algoritmos-cuanticos');
  });

  test('400 — faltan título y contenido', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/articulos-cientificos/publicar-articulo-cientifico')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

// ── DELETE /articulos-cientificos/:id ───────────────────────────────────────
describe('DELETE /articulos-cientificos/:id', () => {
  test('401 — sin token', async () => {
    const res = await request(app).delete('/articulos-cientificos/1');
    expect(res.status).toBe(401);
  });

  test('200 — el autor puede eliminar su propio artículo', async () => {
    // SELECT para obtener el socio dueño (id_socio = 2, igual que tokenSocio)
    pool.query
      .mockResolvedValueOnce({ rows: [{ socio: 2 }], rowCount: 1 }) // owner check
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });             // DELETE

    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' }); // no admin

    const res = await request(app)
      .delete('/articulos-cientificos/1')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
  });

  test('403 — otro socio no puede eliminar un artículo ajeno', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ socio: 99 }], rowCount: 1 }); // dueño = 99

    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' }); // no admin

    const res = await request(app)
      .delete('/articulos-cientificos/1')
      .set('Authorization', `Bearer ${tokenSocio()}`); // id = 2, no 99

    expect(res.status).toBe(403);
  });

  test('200 — el admin puede eliminar cualquier artículo', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ socio: 99 }], rowCount: 1 }) // dueño = 99
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });              // DELETE

    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });

    const res = await request(app)
      .delete('/articulos-cientificos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
  });
});

// ── POST /articulos-cientificos/:id/comentarios ─────────────────────────────
describe('POST /articulos-cientificos/:id/comentarios', () => {
  test('401 — sin token', async () => {
    const res = await request(app)
      .post('/articulos-cientificos/1/comentarios')
      .send({ comentario: 'Muy interesante.' });

    expect(res.status).toBe(401);
  });

  test('200 — socio autenticado publica un comentario', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [MOCK_COMENTARIO], rowCount: 1 }) // INSERT
      .mockResolvedValueOnce({ rows: [MOCK_COMENTARIO], rowCount: 1 }); // SELECT detallado

    const res = await request(app)
      .post('/articulos-cientificos/1/comentarios')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ comentario: 'Muy interesante.' });

    expect(res.status).toBe(200);
    expect(res.body.comentario.comentario).toBe('Muy interesante.');
  });

  test('400 — comentario vacío', async () => {
    const res = await request(app)
      .post('/articulos-cientificos/1/comentarios')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
