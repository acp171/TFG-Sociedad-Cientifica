/**
 * Tests unitarios del middleware de autenticación.
 * Se mockea la BD para no requerir conexión real.
 */

// Mock de la BD ANTES de cualquier require (Jest lo eleva automáticamente)
jest.mock('../src/database', () => ({ query: jest.fn() }));
jest.mock('../src/config/stripe', () => ({}));

const pool = require('../src/database');
const { verificarToken, verificarSuscripcionActiva } = require('../src/middlewares/authMiddleware');
const { tokenAdmin, tokenSocio } = require('./helpers/auth');

// Helper para construir objetos req/res/next de prueba
function buildMocks(headers = {}) {
  const req = { headers, usuario: null };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

// ─────────────────────────────────────────────
// verificarToken
// ─────────────────────────────────────────────
describe('verificarToken', () => {
  test('devuelve 401 si no se envía Authorization header', () => {
    const { req, res, next } = buildMocks();
    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('devuelve 403 si el token es inválido o está manipulado', () => {
    const { req, res, next } = buildMocks({ authorization: 'Bearer token.invalido.xxx' });
    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('llama a next() y adjunta req.usuario con un token válido de admin', () => {
    const token = tokenAdmin();
    const { req, res, next } = buildMocks({ authorization: `Bearer ${token}` });
    verificarToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.usuario).toBeDefined();
    expect(req.usuario.email).toBe('admin@admin.com');
    expect(req.usuario.rol).toBe(1);
  });

  test('llama a next() y adjunta req.usuario con un token válido de socio', () => {
    const token = tokenSocio();
    const { req, res, next } = buildMocks({ authorization: `Bearer ${token}` });
    verificarToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.usuario.rol).toBe(8);
  });
});

// ─────────────────────────────────────────────
// verificarSuscripcionActiva
// ─────────────────────────────────────────────
describe('verificarSuscripcionActiva', () => {
  test('devuelve 401 si no hay token', async () => {
    const { req, res, next } = buildMocks();
    await verificarSuscripcionActiva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('devuelve 403 con requiereRenovacion si la suscripción está caducada', async () => {
    const token = tokenAdmin();
    const { req, res, next } = buildMocks({ authorization: `Bearer ${token}` });

    // La BD devuelve una fecha de expiración en el pasado
    pool.query.mockResolvedValueOnce({
      rows: [{ fecha_expiracion: new Date(Date.now() - 1000) }],
      rowCount: 1,
    });

    await verificarSuscripcionActiva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ requiereRenovacion: true })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('llama a next() si la suscripción está activa', async () => {
    const token = tokenAdmin();
    const { req, res, next } = buildMocks({ authorization: `Bearer ${token}` });

    // La BD devuelve una fecha de expiración en el futuro
    pool.query.mockResolvedValueOnce({
      rows: [{ fecha_expiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }],
      rowCount: 1,
    });

    await verificarSuscripcionActiva(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('devuelve 404 si el socio no existe en BD', async () => {
    const token = tokenSocio();
    const { req, res, next } = buildMocks({ authorization: `Bearer ${token}` });

    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    await verificarSuscripcionActiva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
