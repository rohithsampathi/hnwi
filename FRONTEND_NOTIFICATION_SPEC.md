# Frontend Notification Implementation Specification

## Overview
The frontend has implemented a complete notification system with real-time updates, push notifications, and user preferences management. This document outlines all API endpoints the frontend expects from the backend.

## API Endpoints Required

### 1. GET /api/notifications/inbox
**Purpose**: Fetch paginated list of notifications for the authenticated user

**Query Parameters**:
- `limit` (number, default: 20) - Number of notifications to return
- `offset` (number, default: 0) - Pagination offset
- `unread_only` (boolean, default: false) - Filter to show only unread notifications
- `event_type` (string, optional) - Filter by specific event type

**Expected Response**:
```json
{
  "notifications": [
    {
      "id": "string",
      "user_id": "string",
      "event_type": "elite_pulse | hnwi_world | crown_vault | social_hub | system_notification",
      "channel": "email | push | in_app | sms",
      "priority": "low | medium | high | urgent",
      "title": "string",
      "content": "string",
      "data": {}, // Additional metadata
      "status": "queued | processing | sent | delivered | read | failed | expired",
      "created_at": "ISO 8601 timestamp",
      "read_at": "ISO 8601 timestamp (optional)",
      "clicked_at": "ISO 8601 timestamp (optional)"
    }
  ],
  "total_count": 100,
  "unread_count": 25,
  "has_more": true
}
```

### 2. GET /api/notifications/stats
**Purpose**: Get notification statistics for the authenticated user

**Expected Response**:
```json
{
  "user_id": "string",
  "unread_notifications": 25,
  "total_notifications": 100,
  "notifications_by_type": {
    "elite_pulse_generated": 10,
    "opportunity_added": 15,
    "crown_vault_update": 5,
    "social_event_added": 8,
    "market_alert": 12,
    "regulatory_update": 3,
    "system_notification": 2
  }
}
```

### 3. GET /api/notifications/preferences
**Purpose**: Get notification preferences for the authenticated user

**Expected Response**:
```json
{
  "user_id": "string",
  "email_enabled": true,
  "push_enabled": false,
  "in_app_enabled": true,
  "sms_enabled": false,
  "quiet_hours_enabled": false,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "event_types": {
    "elite_pulse": true,
    "hnwi_world": true,
    "crown_vault": true,
    "social_hub": true,
    "system_notification": true
  },
  "frequency_limits": {
    "max_per_hour": 10,
    "max_per_day": 50
  }
}
```

### 4. PUT /api/notifications/preferences
**Purpose**: Update notification preferences for the authenticated user

**Request Body**: Same structure as GET response above

**Expected Response**: Updated preferences object (same structure as GET)

### 5. POST /api/notifications/{id}/read
**Purpose**: Mark a specific notification as read

**Path Parameters**:
- `id` - Notification ID

**Expected Response**:
```json
{
  "success": true,
  "id": "notification_id",
  "status": "read"
}
```

### 6. POST /api/notifications/{id}/unread
**Purpose**: Mark a specific notification as unread

**Path Parameters**:
- `id` - Notification ID

**Expected Response**:
```json
{
  "success": true,
  "id": "notification_id",
  "status": "delivered"
}
```

### 7. DELETE /api/notifications/{id}
**Purpose**: Delete a specific notification

**Path Parameters**:
- `id` - Notification ID

**Expected Response**:
```json
{
  "success": true,
  "id": "notification_id"
}
```

### 8. POST /api/notifications/mark-all-read
**Purpose**: Mark all notifications as read for the authenticated user

**Expected Response**:
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "updated_count": 25
}
```

### 9. POST /api/notifications/push/subscribe
**Purpose**: Subscribe to push notifications

**Request Body**:
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "base64_encoded_key",
    "auth": "base64_encoded_auth"
  }
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Successfully subscribed to push notifications"
}
```

### 10. DELETE /api/notifications/push/unsubscribe
**Purpose**: Unsubscribe from push notifications

**Expected Response**:
```json
{
  "success": true,
  "message": "Successfully unsubscribed from push notifications"
}
```

### 11. GET /api/notifications/push/vapid-key
**Purpose**: Get VAPID public key for push notifications

**Expected Response**:
```json
{
  "vapid_public_key": "base64_encoded_vapid_public_key"
}
```

## Frontend Implementation Details

### 1. Polling Strategy
- The frontend polls `/api/notifications/stats` every 30 seconds to check for new notifications
- Full inbox refresh happens when user opens notification dropdown/center
- Optimistic updates are used for all user actions (mark read/unread, delete)

### 2. Caching
Frontend implements caching with these durations:
- Inbox: 30 seconds
- Stats: 30 seconds  
- Preferences: 5 minutes
- VAPID key: 1 hour

### 3. Authentication
All endpoints expect authentication via JWT token in cookies. Frontend checks authentication status before making API calls using `getCurrentUser()` utility.

### 4. Error Handling
Frontend expects standard HTTP status codes:
- 200: Success
- 401: Unauthorized (user not authenticated)
- 403: Forbidden (user lacks permission)
- 404: Resource not found
- 500: Internal server error

### 5. Notification Types
Frontend recognizes these event types:
- `elite_pulse_generated` - Elite Pulse intelligence reports
- `opportunity_added` - New investment opportunities
- `crown_vault_update` - Crown Vault asset updates
- `social_event_added` - New social hub events
- `market_alert` - Market movement alerts
- `regulatory_update` - Regulatory changes
- `system_notification` - System messages

### 6. Priority Levels
- `urgent` - Requires immediate attention, shows persistent browser notification
- `high` - Important, highlighted in UI
- `medium` - Standard notifications
- `low` - Informational only

### 7. Notification Channels
- `in_app` - Shows in app notification center
- `email` - Sends email notification
- `push` - Browser push notification
- `sms` - SMS notification (future)

## Service Worker Integration

The frontend has a service worker at `/sw.js` that handles:
1. Push event listening
2. Notification display with actions (View, Dismiss)
3. Click handling to focus/open app
4. Offline caching

Push notification payload expected:
```json
{
  "title": "Notification Title",
  "content": "Notification body text",
  "id": "notification_id",
  "priority": "urgent | high | medium | low",
  "actionUrl": "/path/to/relevant/page"
}
```

## UI Components

### 1. Notification Bell Icon
- Shows unread count badge
- Opens dropdown with recent notifications
- Quick actions: mark as read, delete

### 2. Notification Center
- Full-page view of all notifications
- Filtering by read/unread status
- Batch operations: select all, mark all read, delete selected
- Search and filter by event type

### 3. Notification Preferences
- Channel toggles (Email, Push, In-App, SMS)
- Event type subscriptions
- Quiet hours configuration
- Frequency limits
- Push notification test button

## Real-time Updates

Frontend expects backend to send real-time updates via:
1. WebSocket connection (future implementation)
2. Server-Sent Events (SSE) as fallback
3. Current: Polling mechanism every 30 seconds

## Security Considerations

1. All notification content should be sanitized to prevent XSS
2. User can only access their own notifications
3. Rate limiting should be implemented on all endpoints
4. CORS headers should be properly configured
5. Push notification endpoints should validate subscription ownership

## Testing

Frontend includes mock data for development/testing:
- 2 sample notifications in inbox endpoint
- Mock preferences with defaults
- Mock stats showing unread counts

## Notes for Backend Team

1. **User Association**: All notifications must be associated with `user_id` from authenticated session
2. **Soft Deletes**: Consider implementing soft deletes for notifications (mark as deleted but retain in DB)
3. **Expiry**: Implement notification expiry (e.g., auto-delete after 30 days)
4. **Batching**: Consider batch endpoints for better performance
5. **Webhooks**: Consider webhook support for external integrations
6. **Analytics**: Track notification engagement (open rates, click-through rates)

## Contact

For questions about frontend implementation:
- Review code in `/lib/services/notification-service.ts`
- Check React context in `/contexts/notification-context.tsx`
- See UI components in `/components/notifications/`