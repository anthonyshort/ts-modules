module.exports = {
  automock: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: ['default'],
  testMatch: ['<rootDir>/test/specs/client/**/*.test.ts?(x)'],
  testEnvironment: 'jsdom',
  setupFiles: ['./test/jest.global-setup.js', './test/jest.jsdom-setup.js'],
  setupFilesAfterEnv: ['./test/jest.setup-after-env.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
    '^.+\\.ts?$': 'babel-jest',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.js?$': 'babel-jest',
  },
};
