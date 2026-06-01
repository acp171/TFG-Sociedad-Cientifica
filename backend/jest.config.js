/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/jestSetupEnv.js'],
  testTimeout: 15000,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    '!src/controllers/webhookController.js',
    'src/middlewares/**/*.js',
    'src/utils/slugify.js',
  ],
  coverageThreshold: {
    global: {
      lines: 50,
    },
  },
  verbose: true,
  clearMocks: true,
};
