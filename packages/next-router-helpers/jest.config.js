const baseConfig = require('../../config/jest/dom');

module.exports = {
  ...baseConfig,
  testMatch: ['<rootDir>/tests/**/*.test.ts?(x)'],
};
