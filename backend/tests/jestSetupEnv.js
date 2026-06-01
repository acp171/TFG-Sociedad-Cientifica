// Carga las variables de entorno de .env.test antes de que Jest ejecute los tests.
// Este archivo se especifica en jest.config.js → setupFiles.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.test') });
