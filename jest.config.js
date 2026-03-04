/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
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
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  // Collect coverage from auth-critical files
  collectCoverageFrom: [
    'lib/csrf-protection.ts',
    'lib/unified-auth-manager.ts',
    'lib/secure-api.ts',
  ],
};

module.exports = config;
