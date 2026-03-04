module.exports = {
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
};
