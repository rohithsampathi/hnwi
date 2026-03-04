// Minimal mock for next/server used in unit tests

class MockNextResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = new Map();
    this._cookies = new Map();
    this.cookies = {
      set: (name, value, opts) => this._cookies.set(name, { value, ...opts }),
      get: (name) => this._cookies.get(name),
      delete: (name) => this._cookies.delete(name),
    };
  }
  static json(data, init = {}) {
    const res = new MockNextResponse(JSON.stringify(data), init);
    return res;
  }
  static next(init = {}) {
    return new MockNextResponse('', init);
  }
  async json() {
    return JSON.parse(this.body);
  }
}

class MockNextRequest {
  constructor(url, init = {}) {
    this.url = url || 'http://localhost/test';
    this.method = init.method || 'GET';
    this._headers = new Map(Object.entries(init.headers || {}));
    this._cookies = new Map(Object.entries(init.cookies || {}));
    this.nextUrl = new URL(this.url);

    this.headers = {
      get: (name) => this._headers.get(name.toLowerCase()) || null,
    };
    this.cookies = {
      get: (name) => this._cookies.has(name) ? { name, value: this._cookies.get(name) } : undefined,
      getAll: () => Array.from(this._cookies.entries()).map(([name, value]) => ({ name, value })),
    };
  }
  async json() {
    return JSON.parse(this._body || '{}');
  }
}

module.exports = {
  NextResponse: MockNextResponse,
  NextRequest: MockNextRequest,
};
