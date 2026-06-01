/**
 * Tests de integración: Comités Científicos
 * Cubre: listado, creación, añadir/eliminar miembros, y mensajería en el muro.
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({}));
jest.mock('../src/utils/socioUtils', () => ({
  obtenernRol: jest.fn(),
  obtenerSocio: jest.fn().mockResolvedValue({ nombre: 'Juan', apellidos: 'Pérez' }),
}));
jest.mock('../src/utils/comiteUtils', () => ({
  obtenerNombreComite: jest.fn().mockResolvedValue('Comité IA'),
  obtenerPresidenteComite: jest.fn(),
}));
jest.mock('../src/utils/notificaciones', () => ({
  crearNotificacion: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database');
const { obtenernRol } = require('../src/utils/socioUtils');
const { obtenerPresidenteComite } = require('../src/utils/comiteUtils');
const { tokenAdmin, tokenSocio } = require('./helpers/auth');

const MOCK_COMITE = {
  id_comite: 1,
  nombre_comite: 'Comité IA',
  descripcion: 'Encargados de regular IA.',
  fecha_creacion: new Date().toISOString(),
};

const MOCK_MENSAJE = {
  id_mensaje: 1,
  comite_id: 1,
  socio_id: 2,
  mensaje: 'Hola a todos',
  fecha_envio: new Date().toISOString(),
};

describe('POST /crear-comite-cientifico', () => {
  test('401 — sin token', async () => {
    const res = await request(app).post('/crear-comite-cientifico').send({});
    expect(res.status).toBe(401);
  });

  test('400 — faltan datos obligatorios', async () => {
    // Suscripción activa para pasar middleware
    pool.query.mockResolvedValueOnce({
      rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/crear-comite-cientifico')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre_comite: 'SoloNombre' });

    expect(res.status).toBe(400);
  });

  test('403 — socio normal no-admin no puede crear comités', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
      rowCount: 1,
    });
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });

    const res = await request(app)
      .post('/crear-comite-cientifico')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ nombre_comite: 'Comité IA', descripcion: 'Desc', socio: 2 });

    expect(res.status).toBe(403);
  });

  test('200 — admin puede crear comités con éxito', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ fecha_expiracion: new Date(Date.now() + 86400000) }],
        rowCount: 1,
      }) // suscripción activa
      .mockResolvedValueOnce({ rows: [MOCK_COMITE], rowCount: 1 }) // INSERT comite
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // INSERT miembro

    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });

    const res = await request(app)
      .post('/crear-comite-cientifico')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre_comite: 'Comité IA', descripcion: 'Desc', socio: 2 });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/creado/i);
    expect(res.body.comite.presidente).toMatch(/Juan Pérez/i);
  });
});

describe('GET /listado-comites-cientificos', () => {
  test('200 — obtiene el listado de comités agrupado', async () => {
    const mockRow = {
      id_comite: 1,
      nombre_comite: 'Comité IA',
      descripcion: 'Desc',
      id_socio: 2,
      nombre_socio: 'Juan',
      apellidos: 'Pérez',
      rol: 'Socio',
    };
    pool.query.mockResolvedValueOnce({ rows: [mockRow], rowCount: 1 });

    const res = await request(app)
      .get('/listado-comites-cientificos')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body.listadoComites).toHaveLength(1);
    expect(res.body.listadoComites[0].miembros).toHaveLength(1);
  });
});

describe('POST /add-miembro-comite-cientifico', () => {
  test('200 — admin puede añadir un miembro a un comité', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({
      rows: [{ socio: 3, comite: 1, rol_comite: 6 }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/add-miembro-comite-cientifico')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ socio: 3, comite: 1, rol_comite: 6 });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/añadido/i);
  });

  test('200 — presidente de comité puede añadir un miembro a su comité', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });
    obtenerPresidenteComite.mockResolvedValueOnce({ socio: 2 }); // id=2 es tokenSocio
    pool.query.mockResolvedValueOnce({
      rows: [{ socio: 3, comite: 1, rol_comite: 6 }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/add-miembro-comite-cientifico')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ socio: 3, comite: 1, rol_comite: 6 });

    expect(res.status).toBe(200);
  });
});

describe('DELETE /eliminar-miembro-comite', () => {
  test('200 — presidente de comité puede expulsar a un miembro', async () => {
    obtenerPresidenteComite.mockResolvedValueOnce({ socio: 2 }); // id=2 es tokenSocio
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // DELETE

    const res = await request(app)
      .delete('/eliminar-miembro-comite')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ socio: 3, comite: 1 });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/expulsado/i);
  });
});

describe('Muro de Mensajes de Comités', () => {
  test('GET /comites/:id/mensajes — 200 obtiene mensajes', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_MENSAJE], rowCount: 1 });

    const res = await request(app)
      .get('/comites/1/mensajes')
      .set('Authorization', `Bearer ${tokenSocio()}`);

    expect(res.status).toBe(200);
    expect(res.body.mensajes).toHaveLength(1);
  });

  test('POST /comites/:id/mensajes — 201 envía mensaje si es miembro', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ socio: 2 }], rowCount: 1 }) // auth check
      .mockResolvedValueOnce({ rows: [MOCK_MENSAJE], rowCount: 1 }); // INSERT

    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });

    const res = await request(app)
      .post('/comites/1/mensajes')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ mensaje: 'Mensaje de prueba' });

    expect(res.status).toBe(201);
    expect(res.body.mensaje.mensaje).toBe('Hola a todos');
  });

  test('POST /comites/:id/mensajes — 403 si no es miembro ni admin', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // auth check vacía
    obtenernRol.mockResolvedValueOnce({ nombre: 'Socio' });

    const res = await request(app)
      .post('/comites/1/mensajes')
      .set('Authorization', `Bearer ${tokenSocio()}`)
      .send({ mensaje: 'Mensaje de prueba' });

    expect(res.status).toBe(403);
  });
});
