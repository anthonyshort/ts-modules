module.exports = {
  automock: false,
  // Preset: 'ts-jest',
  cacheDirectory: '<rootDir>/.cache/unit-tests',
  coverageReporters: [['lcov', {projectRoot: '/'}], 'text-summary'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: ['default'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  testMatch: ['<rootDir>/tests/**/*.test.ts?(x)'],
  testEnvironment: 'node',
  setupFiles: ['../../jest.global-setup.js'],
  setupFilesAfterEnv: ['../../jest.setup-after-env.js'],
};
