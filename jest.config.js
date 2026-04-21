/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './babel.jest.config.js' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Stub Next.js server-only modules so unit tests can import lib files
    '^next/headers$': '<rootDir>/__tests__/__mocks__/next-headers.js',
    '^next/server$': '<rootDir>/__tests__/__mocks__/next-server.js',
    '^next/navigation$': '<rootDir>/__tests__/__mocks__/next-navigation.js',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx,js}'],
  // Ignore node_modules and e2e tests
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '<rootDir>/__tests__/pdf/screenshots/'],
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/out/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/public/',
    '<rootDir>/__tests__/pdf/screenshots/',
  ],
  watchPathIgnorePatterns: ['<rootDir>/__tests__/pdf/screenshots/'],
  // Collect coverage from auth-critical files
  collectCoverageFrom: [
    'lib/csrf-protection.ts',
    'lib/unified-auth-manager.ts',
    'lib/secure-api.ts',
  ],
  testTimeout: 15000,
};

module.exports = config;
