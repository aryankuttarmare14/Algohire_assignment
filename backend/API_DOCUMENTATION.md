# Webhook Event Relay System - API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently, the API is open for development. In production, implement API key or JWT authentication.

---

## Events API

### Create Event
**POST** `/events`

Creates a new event and triggers webhook deliveries to all subscribed webhooks.

**Request Body:**
```json
{
  "event_id": "unique_event_id_123",
  "type": "job_created",
  "payload": {
    "job_id": "job_123",
    "title": "Senior Backend Developer",
    "company": "Algohire"
  }
}
```

**Response:**
```json
{
  "success": true,
  "event": {
    "id": 1,
    "event_id": "unique_event_id_123",
    "type": "job_created",
    "payload": {...},
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Event created and queued for delivery"
}
```

**Notes:**
- `event_id` must be unique for idempotency
- If an event with the same `event_id` already exists, it will be ignored

---

### Get All Events
**GET** `/events`

Retrieves all events with pagination.

**Query Parameters:**
- `limit` (optional, default: 50) - Number of events to return
- `offset` (optional, default: 0) - Number of events to skip

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": 1,
      "event_id": "unique_event_id_123",
      "type": "job_created",
      "payload": {...},
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

---

### Get Event by ID
**GET** `/events/:id`

Retrieves a specific event by its database ID.

**Response:**
```json
{
  "success": true,
  "event": {
    "id": 1,
    "event_id": "unique_event_id_123",
    "type": "job_created",
    "payload": {...},
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Events by Type
**GET** `/events/type/:type`

Retrieves all events of a specific type.

**Query Parameters:**
- `limit` (optional, default: 50) - Number of events to return

**Response:**
```json
{
  "success": true,
  "events": [...],
  "count": 10
}
```

---

### Get Delivery Logs for Event
**GET** `/events/:id/delivery-logs`

Retrieves all delivery logs for a specific event.

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "event_id": 1,
      "webhook_id": 1,
      "status": "success",
      "attempt_count": 1,
      "response_code": 200,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Webhooks API

### Create Webhook
**POST** `/webhooks`

Creates a new webhook subscription.

**Request Body:**
```json
{
  "event_type": "job_created",
  "target_url": "https://example.com/webhook",
  "secret": "optional_secret_key"
}
```

**Response:**
```json
{
  "success": true,
  "webhook": {
    "id": 1,
    "event_type": "job_created",
    "target_url": "https://example.com/webhook",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Webhook subscription created successfully"
}
```

**Notes:**
- If `secret` is not provided, a random 32-byte hex secret will be generated
- The secret is used to generate HMAC signatures for webhook verification

---

### Get All Webhooks
**GET** `/webhooks`

Retrieves all webhook subscriptions.

**Response:**
```json
{
  "success": true,
  "webhooks": [
    {
      "id": 1,
      "event_type": "job_created",
      "target_url": "https://example.com/webhook",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### Get Webhook by ID
**GET** `/webhooks/:id`

Retrieves a specific webhook by ID.

**Response:**
```json
{
  "success": true,
  "webhook": {
    "id": 1,
    "event_type": "job_created",
    "target_url": "https://example.com/webhook",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Update Webhook
**PUT** `/webhooks/:id`

Updates an existing webhook.

**Request Body:**
```json
{
  "event_type": "candidate_updated",
  "target_url": "https://new-url.com/webhook",
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "webhook": {...},
  "message": "Webhook updated successfully"
}
```

---

### Delete Webhook
**DELETE** `/webhooks/:id`

Deletes a webhook subscription.

**Response:**
```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

---

### Toggle Webhook Status
**PATCH** `/webhooks/:id/toggle`

Toggles the active status of a webhook.

**Response:**
```json
{
  "success": true,
  "webhook": {...},
  "message": "Webhook status toggled successfully"
}
```

---

## Dashboard API

### Get Statistics
**GET** `/dashboard/stats`

Retrieves system statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "events": {
      "total": 150
    },
    "webhooks": {
      "total": 10,
      "active": 8
    },
    "deliveries": {
      "successful": 1200,
      "failed": 45
    }
  }
}
```

---

### Get Health Status
**GET** `/dashboard/health`

Checks the health of database and Redis connections.

**Response:**
```json
{
  "success": true,
  "health": {
    "database": "healthy",
    "redis": "healthy",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Recent Logs
**GET** `/dashboard/logs`

Retrieves recent delivery logs.

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "event_id": 1,
      "webhook_id": 1,
      "status": "success",
      "attempt_count": 1,
      "response_code": 200,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

---

### Retry Delivery
**POST** `/dashboard/retry/:logId`

Manually retries a failed delivery.

**Response:**
```json
{
  "success": true,
  "message": "Delivery marked for retry"
}
```

---

## Webhook Delivery

When an event is created, the system automatically delivers the event to all active webhooks subscribed to that event type.

### Delivery Request
The webhook endpoint receives a POST request with the following headers:

```
Content-Type: application/json
x-algohire-signature: <hmac-sha256-signature>
x-algohire-event-type: <event-type>
x-algohire-event-id: <event-id>
x-algohire-timestamp: <iso-timestamp>
```

The body contains the event payload as JSON.

### Signature Verification
Webhook recipients should verify the HMAC signature:

1. Extract the signature from `x-algohire-signature` header
2. Calculate HMAC-SHA256 using the stored secret and the request body
3. Compare the calculated signature with the received signature

**Example (Node.js):**
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (health check failures)

---

## Rate Limiting

Currently not implemented. In production, add rate limiting middleware to prevent abuse.

