// Mock for next/headers — used in server-only code tested via unit tests
const cookieStore = new Map();

module.exports = {
  cookies: jest.fn(() => ({
    get: (name) => cookieStore.get(name) ? { value: cookieStore.get(name) } : undefined,
    set: (name, value) => cookieStore.set(name, value),
    delete: (name) => cookieStore.delete(name),
    getAll: () => Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value })),
  })),
  __cookieStore: cookieStore, // expose for test setup
};
