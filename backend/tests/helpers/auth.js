/**
 * Helper para generar tokens JWT válidos en los tests.
 * Usa la misma JWT_SECRET que se carga desde .env.test.
 */
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'test_secret_key_for_jest';

/**
 * Token de socio administrador (rol 1)
 * con suscripción activa (expira en 1 año).
 */
function tokenAdmin() {
  return jwt.sign(
    {
      id: 1,
      email: 'admin@admin.com',
      nombre: 'admin',
      rol: 1,
      tipo: 1,
      fecha_expiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Token de socio normal (rol 8, tipo 2 — Estudiante).
 * Suscripción activa.
 */
function tokenSocio() {
  return jwt.sign(
    {
      id: 2,
      email: 'socio@test.com',
      nombre: 'Socio',
      rol: 8,
      tipo: 2,
      fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Token con suscripción caducada (para probar bloqueo).
 */
function tokenExpirado() {
  return jwt.sign(
    {
      id: 3,
      email: 'expirado@test.com',
      nombre: 'Expirado',
      rol: 8,
      tipo: 1,
      fecha_expiracion: new Date(Date.now() - 1000).toISOString(), // ya expiró
    },
    SECRET,
    { expiresIn: '1h' }
  );
}

module.exports = { tokenAdmin, tokenSocio, tokenExpirado };
