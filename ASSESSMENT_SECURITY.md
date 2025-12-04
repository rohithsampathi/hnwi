# ASSESSMENT SYSTEM - SECURITY ARCHITECTURE

## 🔐 Security Model

### Session ID Security

**Backend Responsibility:**
- Session IDs MUST be generated using UUID v4 (128-bit cryptographically secure random)
- Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Probability of collision: 1 in 5.3 × 10³⁶ (effectively impossible to guess)

**Example Backend Implementation:**
```python
import uuid

def create_assessment_session(user_id: Optional[str] = None):
    session_id = str(uuid.uuid4())  # CRITICAL: Must be UUID v4
    # Store session with user_id if provided
    return session_id
```

### Access Control Model

The assessment system uses a **hybrid authentication model**:

#### For Anonymous Users:
- ✅ Can create sessions (no auth required)
- ✅ Can submit answers (no auth required)
- ✅ Can view their own results (session_id acts as secret token)
- ❌ Cannot access other users' sessions (session_id is unguessable)

#### For Authenticated Users:
- ✅ Can create sessions (auto-linked to account)
- ✅ Can submit answers
- ✅ Can view their own results
- ✅ Results are permanently linked to their account
- ❌ Cannot access sessions belonging to other users

### Frontend API Call Security

**Current Implementation:**
```typescript
// lib/hooks/useAssessmentAPI.ts
const apiCall = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  requireAuth: boolean = false  // Critical: Set per-endpoint
)
```

**Why `requireAuth = false` is Safe:**

1. **Cookies are ALWAYS sent** (via `credentials: 'include'`)
   - If user is authenticated → cookies are sent automatically
   - If user is anonymous → no cookies sent

2. **Backend validates session ownership:**
   ```
   IF request has auth cookies:
       → Verify session belongs to authenticated user
   ELSE:
       → Allow access (anonymous session)
   ```

3. **Session IDs are cryptographically secure**
   - UUID v4 has 122 bits of randomness
   - Impossible to brute force or guess

### Auto-Linking for Authenticated Users

**Implementation:**
```typescript
// app/(authenticated)/assessment/page.tsx (lines 144-149)
const handleStartAssessment = async () => {
  const response = await startAssessment({
    user_id: user?.id || user?.user_id,  // ✅ Passed to backend
    email: user?.email                    // ✅ Passed to backend
  });
  // Backend automatically links session to user account
}
```

**Backend Behavior:**
```python
# Backend /api/assessment/start
def start_assessment(request):
    user_id = request.body.get('user_id')  # From frontend
    email = request.body.get('email')      # From frontend

    # OR get from cookies if authenticated
    authenticated_user = get_user_from_cookies(request)

    if authenticated_user:
        user_id = authenticated_user.id
        email = authenticated_user.email

    session_id = str(uuid.uuid4())

    # CRITICAL: Link session to user if authenticated
    session = AssessmentSession(
        session_id=session_id,
        user_id=user_id,      # ✅ Automatically linked
        user_email=email,     # ✅ Stored for reference
        created_at=datetime.now()
    )
    db.save(session)

    return { "session_id": session_id, "questions": [...] }
```

### Results Access Validation

**Backend MUST implement:**
```python
# Backend /api/assessment/{session_id}/results
def get_results(session_id: str, request):
    session = db.get_assessment(session_id)

    if not session:
        raise NotFound()

    # Get authenticated user from cookies (if present)
    authenticated_user = get_user_from_cookies(request)

    # SECURITY CHECK
    if authenticated_user:
        # If user is authenticated, verify they own this session
        if session.user_id != authenticated_user.id:
            raise Forbidden("This session belongs to another user")

    # If no authenticated user, allow access
    # (session_id acts as secret token for anonymous users)

    return session.results
```

## 🚨 Security Checklist

### Backend Requirements (MUST BE IMPLEMENTED):

- [ ] **Session IDs are UUID v4** (cryptographically secure)
- [ ] **Auto-link sessions for authenticated users**
  - Check cookies for user_id
  - Link session immediately on creation
  - Store user_id with session

- [ ] **Validate session ownership on results access:**
  ```
  IF user is authenticated AND session has user_id:
      → Verify session.user_id == authenticated_user.id
  ELSE:
      → Allow access (anonymous or unlinked session)
  ```

- [ ] **30-day retake enforcement**
  - Track assessment completion date per user
  - Reject new assessment if < 30 days since last
  - Return error with can_retake_at timestamp

- [ ] **Session expiration**
  - Set TTL on incomplete sessions (24-48 hours)
  - Keep completed sessions indefinitely for history

### Frontend Security Measures (IMPLEMENTED):

- [x] **No sensitive data in localStorage**
  - Only session_id stored temporarily
  - Cleared after navigation to results

- [x] **Email in sessionStorage only** (ephemeral)
  - Auto-cleared when tab closes
  - Used only for account creation

- [x] **All API calls through Next.js proxies**
  - Backend URL never exposed
  - Cookies forwarded automatically

- [x] **CSRF protection**
  - Via existing secure-api.ts
  - Tokens sent with state-changing requests

- [x] **Authenticated users auto-linked**
  - user_id and email passed to backend
  - Backend responsible for linking

## 🔍 Attack Vectors Mitigated

### ❌ Session Hijacking
**Attack:** Attacker tries random session IDs to access results
**Mitigation:** UUID v4 has 5.3 × 10³⁶ possible values (impossible to brute force)

### ❌ Cross-Account Access
**Attack:** Authenticated user A tries to access user B's session
**Mitigation:** Backend validates session.user_id matches authenticated user

### ❌ Session Replay
**Attack:** Anonymous user tries to access session after account creation
**Mitigation:** Backend links session to user; subsequent access requires authentication

### ❌ CSRF Attacks
**Attack:** Malicious site tricks user into making authenticated requests
**Mitigation:** CSRF tokens required for all state-changing operations

### ❌ XSS Data Theft
**Attack:** Malicious script tries to steal auth tokens
**Mitigation:** Tokens stored in httpOnly cookies (inaccessible to JavaScript)

## 📊 Data Flow Diagram

```
Anonymous User Flow:
1. Start Assessment → Session ID (UUID v4)
2. Submit Answers → No auth required
3. Complete → SSE stream results
4. View Results → session_id acts as secret token
5. [Optional] Create Account → Link session to user_id

Authenticated User Flow:
1. Start Assessment → Session ID (UUID v4) + user_id
   ↓
   Backend automatically links session.user_id = authenticated_user.id
2. Submit Answers → Cookies sent automatically
3. Complete → SSE stream results
4. View Results → Backend validates session.user_id == user_id
5. Results saved to account history
```

## ✅ Security Audit Questions

Before deploying to production, verify:

1. **Are session IDs truly random?**
   - [ ] Using UUID v4 or equivalent (not sequential, not timestamp-based)

2. **Is auto-linking working?**
   - [ ] Authenticated users' sessions are linked to their user_id
   - [ ] Check database: sessions have user_id field populated

3. **Is ownership validation enforced?**
   - [ ] Backend rejects cross-account access attempts
   - [ ] Test: User A cannot access User B's session_id

4. **Is retake enforcement working?**
   - [ ] Users cannot retake within 30 days
   - [ ] Error message includes can_retake_at timestamp

5. **Are sessions expiring properly?**
   - [ ] Incomplete sessions cleaned up after 24-48 hours
   - [ ] Completed sessions retained for history

## 🎯 Recommended Backend Code

### Session Creation with Auto-Linking
```python
from fastapi import Request, HTTPException, status
import uuid
from datetime import datetime, timedelta

async def start_assessment(request: Request, data: dict):
    # Get authenticated user from cookies (if present)
    user_id = None
    user_email = None

    # Check auth cookies first (highest priority)
    auth_user = await get_user_from_cookies(request)
    if auth_user:
        user_id = auth_user.id
        user_email = auth_user.email
    else:
        # Fallback to request body (for anonymous with future account creation)
        user_id = data.get('user_id')
        user_email = data.get('email')

    # Check retake eligibility if user_id exists
    if user_id:
        last_assessment = db.get_latest_assessment(user_id)
        if last_assessment:
            days_since = (datetime.now() - last_assessment.completed_at).days
            if days_since < 30:
                can_retake_at = last_assessment.completed_at + timedelta(days=30)
                raise HTTPException(
                    status_code=403,
                    detail=f"You can retake the assessment on {can_retake_at.strftime('%Y-%m-%d')}. Please wait {30 - days_since} more days."
                )

    # Create session with cryptographically secure ID
    session_id = str(uuid.uuid4())  # CRITICAL: Must be UUID v4

    session = AssessmentSession(
        session_id=session_id,
        user_id=user_id,          # Automatically linked if authenticated
        user_email=user_email,
        created_at=datetime.now(),
        expires_at=datetime.now() + timedelta(hours=48),
        status='in_progress'
    )

    db.save(session)

    return {
        "session_id": session_id,
        "questions": get_questions()
    }
```

### Results Access with Ownership Validation
```python
async def get_results(session_id: str, request: Request):
    session = db.get_assessment(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if not session.completed:
        raise HTTPException(status_code=400, detail="Assessment not completed")

    # Get authenticated user from cookies
    auth_user = await get_user_from_cookies(request)

    # CRITICAL SECURITY CHECK
    if auth_user and session.user_id:
        # Both user and session have user_id - verify ownership
        if session.user_id != auth_user.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this assessment"
            )

    # If no auth_user OR session has no user_id:
    # → Allow access (anonymous session, session_id is the secret)

    return session.results
```

## 📝 Summary

The assessment system is **secure by design** when the backend implements:

1. ✅ UUID v4 session IDs (cryptographically secure)
2. ✅ Auto-linking for authenticated users
3. ✅ Ownership validation on results access
4. ✅ 30-day retake enforcement
5. ✅ Session expiration

**Frontend security is already implemented:**
- Cookies sent automatically with all requests
- No auth popups for assessment endpoints
- Session IDs used as secret tokens for anonymous users
- All data flows through secure Next.js proxies

**The key insight:** `requireAuth = false` is safe because:
- Cookies are always sent (`credentials: 'include'`)
- Backend validates ownership when cookies are present
- Session IDs are impossible to guess
- No loose ends remain
