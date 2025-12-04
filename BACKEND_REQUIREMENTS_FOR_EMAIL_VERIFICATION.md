# Backend Requirements for Email Verification System

This document outlines the backend API endpoints required to support the email verification system implemented in the frontend.

## Overview

The email verification system allows users to verify their email addresses during registration or when changing their email. The system uses secure tokens with expiration times.

## Required Backend Endpoints

### 1. Store Verification Token

**Endpoint**: `POST /api/auth/verification-tokens`

**Purpose**: Store a verification token for a user

**Request Body**:
```json
{
  "user_id": "string (required)",
  "user_email": "string (required)",
  "token": "string (required, 64 hex characters)",
  "expires_at": "string (required, ISO 8601 datetime)"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "token_id": "string",
  "expires_at": "string (ISO 8601 datetime)"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Missing required fields",
  "message": "user_id, user_email, token, and expires_at are required"
}
```

**Database Schema** (Suggested):
```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

---

### 2. Verify Email Token

**Endpoint**: `POST /api/auth/verify-email`

**Purpose**: Verify a user's email using the verification token

**Request Body**:
```json
{
  "token": "string (required, 64 hex characters)"
}
```

**Alternative**: `POST /api/auth/verify-email?token={token}`

**Response** (200 OK):
```json
{
  "success": true,
  "user_id": "string",
  "user_email": "string",
  "verified_at": "string (ISO 8601 datetime)"
}
```

**Response** (404 Not Found):
```json
{
  "error": "Invalid verification token",
  "message": "This verification link is invalid or has already been used."
}
```

**Response** (410 Gone):
```json
{
  "error": "Verification token expired",
  "message": "This verification link has expired. Please request a new one."
}
```

**Business Logic**:
1. Look up token in database
2. Check if token exists
   - If not found → 404 response
3. Check if token has been used (`used_at` is not null)
   - If already used → 404 response
4. Check if token has expired (`expires_at < NOW()`)
   - If expired → 410 response
5. Mark token as used (`used_at = NOW()`)
6. Update user's email verification status in users table
7. Return success response with user details

**Database Updates**:
```sql
-- Mark token as used
UPDATE email_verification_tokens
SET used_at = CURRENT_TIMESTAMP
WHERE token = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP;

-- Update user's email verification status
UPDATE users
SET email_verified = true,
    email_verified_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

---

### 3. Record Payment (with Email)

**Endpoint**: `POST /api/payments/record`

**Purpose**: Record payment in backend and associate with user email

**Request Body**:
```json
{
  "payment_id": "string (required)",
  "order_id": "string (required)",
  "tier": "operator | observer (required)",
  "session_id": "string (required)",
  "verified_at": "string (required, ISO 8601 datetime)",
  "user_email": "string (optional, for email confirmation)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "payment_record_id": "string",
  "tier": "operator | observer",
  "recorded_at": "string (ISO 8601 datetime)"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Missing required fields",
  "message": "payment_id, order_id, tier, and session_id are required"
}
```

**Business Logic**:
1. Validate required fields
2. Store payment record in database
3. Update user's tier if user_id is available
4. Return success response

**Database Schema** (Suggested):
```sql
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id VARCHAR(255) NOT NULL UNIQUE,
  order_id VARCHAR(255) NOT NULL,
  tier VARCHAR(50) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  verified_at TIMESTAMP NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payment_id (payment_id),
  INDEX idx_order_id (order_id),
  INDEX idx_session_id (session_id)
);
```

---

### 4. Webhook Payment Capture (Optional)

**Endpoint**: `POST /api/payments/webhook-capture`

**Purpose**: Handle payment capture event from Razorpay webhook

**Request Body**:
```json
{
  "payment_id": "string (required)",
  "order_id": "string (required)",
  "amount": "number (required, in smallest currency unit)",
  "currency": "string (required)",
  "captured_at": "string (required, ISO 8601 datetime)",
  "user_email": "string (optional)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment capture recorded"
}
```

**Business Logic**:
1. Look up payment record by payment_id or order_id
2. Update payment status to "captured"
3. Store capture timestamp
4. Update user tier if applicable
5. Return success response

---

### 5. Webhook Payment Failed (Optional)

**Endpoint**: `POST /api/payments/webhook-failed`

**Purpose**: Handle payment failure event from Razorpay webhook

**Request Body**:
```json
{
  "payment_id": "string (required)",
  "order_id": "string (required)",
  "error_code": "string (optional)",
  "error_description": "string (optional)",
  "failed_at": "string (required, ISO 8601 datetime)",
  "user_email": "string (optional)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment failure recorded"
}
```

**Business Logic**:
1. Look up payment record by payment_id or order_id
2. Update payment status to "failed"
3. Store failure reason and timestamp
4. Optionally notify user via email
5. Return success response

---

## User Schema Requirements

The users table should include email verification fields:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'free';
```

---

## Security Considerations

### Token Generation
- Use cryptographically secure random bytes (32 bytes = 64 hex characters)
- Frontend uses: `crypto.randomBytes(32).toString('hex')`
- Backend should validate token format: `/^[a-f0-9]{64}$/`

### Token Expiration
- Recommended: 24 hours for email verification
- Delete expired tokens regularly (cleanup job)
- Never reuse tokens

### Token Storage
- Store tokens hashed (optional but recommended)
- Use unique index on token column
- Implement rate limiting on token creation (max 5 per user per hour)

### Email Verification
- Mark email as verified only after successful token verification
- Allow users to resend verification email (with rate limiting)
- Invalidate old tokens when sending new one for same user

---

## Testing Backend Endpoints

### Test Token Storage

```bash
curl -X POST http://localhost:8000/api/auth/verification-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "user_email": "test@example.com",
    "token": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "expires_at": "2024-12-04T12:00:00Z"
  }'
```

Expected response:
```json
{
  "success": true,
  "token_id": "uuid-here",
  "expires_at": "2024-12-04T12:00:00Z"
}
```

### Test Token Verification

```bash
curl -X POST http://localhost:8000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  }'
```

Expected response (success):
```json
{
  "success": true,
  "user_id": "test_user_123",
  "user_email": "test@example.com",
  "verified_at": "2024-12-03T10:30:00Z"
}
```

Expected response (expired):
```json
{
  "error": "Verification token expired",
  "message": "This verification link has expired. Please request a new one."
}
```

### Test Payment Recording

```bash
curl -X POST http://localhost:8000/api/payments/record \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "pay_test123",
    "order_id": "order_test456",
    "tier": "operator",
    "session_id": "sess_test789",
    "verified_at": "2024-12-03T10:30:00Z",
    "user_email": "test@example.com"
  }'
```

Expected response:
```json
{
  "success": true,
  "payment_record_id": "uuid-here",
  "tier": "operator",
  "recorded_at": "2024-12-03T10:30:00Z"
}
```

---

## Integration Checklist

- [ ] Create `email_verification_tokens` table in database
- [ ] Add `email_verified` and `email_verified_at` columns to users table
- [ ] Implement `POST /api/auth/verification-tokens` endpoint
- [ ] Implement `POST /api/auth/verify-email` endpoint
- [ ] Update `POST /api/payments/record` to accept `user_email`
- [ ] Create `POST /api/payments/webhook-capture` endpoint (optional)
- [ ] Create `POST /api/payments/webhook-failed` endpoint (optional)
- [ ] Implement token expiration cleanup job
- [ ] Add rate limiting for token creation
- [ ] Test all endpoints with curl or Postman
- [ ] Verify email flow end-to-end

---

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {} // Optional additional context
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (for token storage)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (invalid token)
- `410` - Gone (expired token)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Next Steps

1. Review this document with backend team
2. Implement required endpoints
3. Test each endpoint individually
4. Test complete email verification flow
5. Configure Razorpay webhooks (optional)
6. Deploy and monitor

For questions or clarification, contact: hnwi@montaigne.co
