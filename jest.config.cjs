module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['src/**/*.js'],
  extensionsToTreatAsEsm: ['.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(supertest)/)'
  ]
};