/**
 * Tests de integración: Panel de Administración (Roles, Tipos de socios, Asignación)
 */

jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({}));
jest.mock('../src/utils/socioUtils', () => ({
  obtenernRol: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database');
const { obtenernRol } = require('../src/utils/socioUtils');
const { tokenAdmin, tokenSocio } = require('./helpers/auth');

global.fetch = jest.fn();

describe('Panel de Administración — Gestión de Roles', () => {
  test('GET /roles — 200 listado de roles (admin)', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, nombre: 'Administrador' }],
      rowCount: 1,
    });

    const res = await request(app)
      .get('/roles')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.roles).toHaveLength(1);
  });

  test('POST /roles — 200 crea rol (admin)', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({
      rows: [{ id_socio_rol: 9, nombre: 'Nuevo Rol' }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/roles')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Nuevo Rol' });

    expect(res.status).toBe(200);
    expect(res.body.roles.nombre).toBe('Nuevo Rol');
  });

  test('PUT /roles/:id — 200 actualiza rol', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({
      rows: [{ id_socio_rol: 9, nombre: 'Rol Modificado' }],
      rowCount: 1,
    });

    const res = await request(app)
      .put('/roles/9')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Rol Modificado' });

    expect(res.status).toBe(200);
    expect(res.body.roles.nombre).toBe('Rol Modificado');
  });

  test('DELETE /roles/:id — 200 elimina rol', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .delete('/roles/9')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
  });
});

describe('Panel de Administración — Gestión de Tipos', () => {
  test('GET /tipos — 200 listado de tipos de socios', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({
      rows: [{ id_tipo_socio: 1, nombre_tipo: 'Estudiante', cuota: 10 }],
      rowCount: 1,
    });

    const res = await request(app)
      .get('/tipos')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.tipos).toHaveLength(1);
  });

  test('POST /tipos — 200 crea tipo de socio', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({
      rows: [{ id_tipo_socio: 7, nombre_tipo: 'Nuevo Tipo', cuota: 100 }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/tipos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre_tipo: 'Nuevo Tipo', descripcion: 'Desc', cuota: 100, price_stripe: 'price_xyz' });

    expect(res.status).toBe(200);
    expect(res.body.tipo.nombre_tipo).toBe('Nuevo Tipo');
  });
});

describe('Panel de Administración — Asignar y Eliminar Roles', () => {
  test('PUT /asignar-rol — asigna rol a socio en un comité', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // UPDATE

    const res = await request(app)
      .put('/asignar-rol')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ id_socio: 3, rol: 2, comite: 1, funcion: 'comite' });

    expect(res.status).toBe(200);
  });

  test('DELETE /eliminar-rol — elimina rol de socio en un proyecto', async () => {
    obtenernRol.mockResolvedValueOnce({ nombre: 'Administrador' });
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // DELETE

    const res = await request(app)
      .delete('/eliminar-rol')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ id_socio: 3, proyecto: 1, funcion: 'proyecto' });

    expect(res.status).toBe(200);
  });
});

describe('Administración — Buscar Calles', () => {
  test('GET /buscar-calles — 200 devuelve geolocalización de calles', async () => {
    const mockGeocode = [{ place_id: 123, display_name: 'Gran Vía, Madrid' }];
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockGeocode),
    });

    const res = await request(app).get('/buscar-calles?provincia=Madrid&query=Gran%20Via');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].display_name).toBe('Gran Vía, Madrid');
  });

  test('GET /buscar-calles — 400 si faltan parámetros', async () => {
    const res = await request(app).get('/buscar-calles?query=Gran%20Via');
    expect(res.status).toBe(400);
  });
});
