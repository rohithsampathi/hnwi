# Frontend Authentication Flow - Complete Implementation Debug

## 🎯 Issue: API calls return 401 after successful authentication

## ✅ Working Authentication Flow

### 1. **Login Request**
```javascript
// POST /api/auth/login
const response = await secureApi.post('/api/auth/login', {
  email: "rohith.sampathi@gmail.com",
  password: "password"
}, false); // requireAuth = false for login
```

**Request Headers:**
```
Content-Type: application/json
credentials: include
```

**Request Body:**
```json
{
  "email": "rohith.sampathi@gmail.com",
  "password": "password"
}
```

**Response:** ✅ 200 OK - MFA code sent

### 2. **MFA Verification Request**
```javascript
// POST /api/auth/mfa/verify
const response = await secureApi.post('/api/auth/mfa/verify', {
  email: "rohith.sampathi@gmail.com",
  code: "GA2FHT"
}, false); // requireAuth = false for verification
```

**Request Headers:**
```
Content-Type: application/json
credentials: include
```

**Request Body:**
```json
{
  "email": "rohith.sampathi@gmail.com",
  "code": "GA2FHT"
}
```

**Response:** ✅ 200 OK - Authentication successful, cookies set

## ❌ Failing API Requests (After Authentication)

All subsequent API calls return 401 Unauthorized despite successful authentication:

### 3. **Intelligence Dashboard Request**
```javascript
// GET /api/hnwi/intelligence/dashboard/59363d04-eb97-4224-94cf-16ca0d4f746e
const response = await secureApi.get(
  '/api/hnwi/intelligence/dashboard/59363d04-eb97-4224-94cf-16ca0d4f746e',
  true // requireAuth = true
);
```

**Request Headers:**
```
Content-Type: application/json
credentials: include
```

**Response:** ❌ 401 Unauthorized

### 4. **Notifications Inbox Request**
```javascript
// GET /api/notifications/inbox?limit=20&offset=0&unread_only=false
const response = await secureApi.get(
  '/api/notifications/inbox?limit=20&offset=0&unread_only=false',
  true // requireAuth = true
);
```

**Request Headers:**
```
Content-Type: application/json
credentials: include
```

**Response:** ❌ 401 Unauthorized

### 5. **Notifications Preferences Request**
```javascript
// GET /api/notifications/preferences
const response = await secureApi.get('/api/notifications/preferences', true);
```

**Request Headers:**
```
Content-Type: application/json
credentials: include
```

**Response:** ❌ 401 Unauthorized

### 6. **Crown Vault Assets Request**
```javascript
// GET /api/crown-vault/assets/detailed?owner_id=59363d04-eb97-4224-94cf-16ca0d4f746e
const response = await secureApi.get(
  '/api/crown-vault/assets/detailed?owner_id=59363d04-eb97-4224-94cf-16ca0d4f746e',
  true
);
```

**Request Headers:**
```
Content-Type: application/json
credentials: include
```

**Response:** ❌ 401 Unauthorized

## 🔧 Frontend secureApi Implementation

### Core API Function
```typescript
export const secureApiCall = async (
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`; // http://localhost:8000

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add CSRF token for state-changing requests
  const method = options.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // CRITICAL: Send cookies with request
    });

    // Handle authentication errors
    if (response.status === 401 && requireAuth) {
      // Try to refresh token automatically
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCookie('csrf_token') || '',
          },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          // Retry original request with new token
          return fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        }
      } catch (error) {
        // Refresh failed
        throw new Error('Authentication failed - session expired');
      }

      throw new Error('Authentication failed - please login again');
    }

    return response;
  } catch (error) {
    throw new Error('Network request failed');
  }
};
```

### GET Method Implementation
```typescript
async get(endpoint: string, requireAuth: boolean = true, options?: { enableCache?: boolean; cacheDuration?: number }): Promise<any> {
  const response = await secureApiCall(endpoint, { method: 'GET' }, requireAuth);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return await response.json();
}
```

### Cookie Helper Function
```typescript
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};
```

## 🔍 Technical Details

### Environment Configuration
```
Frontend URL: http://localhost:3002 (Next.js)
Backend URL:  http://localhost:8000 (FastAPI)
API_BASE_URL: http://localhost:8000
```

### Request Flow
1. Frontend at `localhost:3002` makes request to `localhost:8000`
2. Uses `credentials: 'include'` to send cookies
3. Backend should receive auth cookies set during MFA verification
4. Backend returns 401 instead of recognizing authentication

### Expected vs Actual Behavior

**Expected:**
- POST /api/auth/login → 200 OK ✅
- POST /api/auth/mfa/verify → 200 OK, sets auth cookies ✅
- GET /api/notifications/inbox → 200 OK with data ❌ (getting 401)

**Actual:**
- Authentication works perfectly
- All subsequent API calls return 401 Unauthorized

## 🎯 Questions for Backend Team

1. **Cookie Domain**: Are auth cookies being set with correct domain for cross-origin access?
   - Current: `localhost:8000` (port-specific)
   - Needed: `localhost` (all ports) or proper CORS handling

2. **Cookie Verification**: Is the backend properly reading cookies from `credentials: 'include'` requests?

3. **CSRF Requirements**: Do GET requests require CSRF tokens, or is cookie authentication sufficient?

4. **Token Refresh**: The frontend implements automatic token refresh on 401 - is this the correct approach?

## 🔧 Potential Solutions

### Option 1: Cookie Domain Fix (Backend)
```python
# Set cookies with domain that allows cross-origin
response.set_cookie(
    "access_token",
    value=token,
    domain="localhost",  # Allow all localhost ports
    samesite="lax",      # Enable cross-origin
    secure=False,        # HTTP for development
    httponly=True
)
```

### Option 2: CORS Headers (Backend)
```python
# Ensure CORS allows credentials
CORS(app,
     origins=["http://localhost:3002"],
     supports_credentials=True,
     allow_headers=["Content-Type", "X-CSRF-Token"]
)
```

### Option 3: Cookie Debugging
Please log what cookies the backend receives on failed 401 requests to identify if cookies are being transmitted.

## 🚨 **ROOT CAUSE IDENTIFIED: CORS Configuration**

**Browser Error:**
```
Access to fetch at 'http://localhost:8000/api/crown-vault/heirs'
from origin 'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present
```

## 📋 Current Status

- ✅ Authentication flow: Working perfectly
- ✅ Frontend implementation: Complete and correct
- ❌ **CORS Issue: Backend not allowing localhost:3000 origin**
- 🎯 **Solution: Backend CORS configuration needed**

## 🔧 **BACKEND FIX REQUIRED:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003"
    ],
    allow_credentials=True,  # CRITICAL for cookie authentication
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
)
```

**This is NOT a frontend issue.** The browser is blocking requests due to missing CORS headers from the backend.