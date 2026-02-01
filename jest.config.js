module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['bot.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
