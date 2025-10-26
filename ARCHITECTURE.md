# System Architecture

## Overview

The Algohire Webhook Event Relay System is a robust, production-ready solution for managing event-driven webhook deliveries with built-in retry logic, signature verification, and a comprehensive management dashboard.

## System Components

### 1. Backend API (Node.js + Express)

**Location:** `backend/`

**Key Features:**
- RESTful API for event ingestion
- Webhook subscription management
- Automatic delivery to subscribed endpoints
- HMAC-SHA256 signature generation
- Redis caching for performance
- PostgreSQL for persistent storage
- BullMQ for background job processing

**Core Modules:**

#### Config Layer (`backend/src/config/`)
- `database.js` - PostgreSQL connection and table initialization
- `redis.js` - Redis client for caching and queues

#### Services Layer (`backend/src/services/`)
- `eventService.js` - Event CRUD operations
- `webhookService.js` - Webhook subscription management
- `webhookDeliveryService.js` - Core delivery logic with retry

#### Controllers Layer (`backend/src/controllers/`)
- `eventController.js` - HTTP handlers for events API
- `webhookController.js` - HTTP handlers for webhooks API
- `dashboardController.js` - Analytics and health monitoring

#### Routes Layer (`backend/src/routes/`)
- `eventRoutes.js` - Event API endpoints
- `webhookRoutes.js` - Webhook API endpoints
- `dashboardRoutes.js` - Dashboard endpoints

#### Utilities (`backend/src/utils/`)
- `hmac.js` - Signature generation and verification
- `seed.js` - Sample data seeding

#### Workers (`backend/src/workers/`)
- `retryWorker.js` - Background job processing for retries

### 2. Frontend Dashboard (React + ShadCN UI)

**Location:** `frontend/`

**Key Features:**
- Modern React SPA with Vite
- Tailwind CSS for styling
- ShadCN UI components
- Real-time status updates
- Webhook management interface
- Delivery log viewer
- System health monitoring

**Core Modules:**

#### Pages (`frontend/src/pages/`)
- `Dashboard.jsx` - Overview with statistics
- `Webhooks.jsx` - Webhook management (CRUD)
- `EventLogs.jsx` - Delivery history viewer
- `Settings.jsx` - System health and configuration

#### Components (`frontend/src/components/`)
- `Layout.jsx` - Main layout with sidebar navigation
- `ui/` - Reusable UI components (Button, Card, Dialog, etc.)

#### Services (`frontend/src/services/`)
- `api.js` - Axios wrapper for API calls

### 3. Database (PostgreSQL)

**Schema:**

```sql
-- Events: Store all incoming events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,  -- For idempotency
  type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks: Active subscriptions
CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  target_url TEXT NOT NULL,
  secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Logs: Track all delivery attempts
CREATE TABLE delivery_logs (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  webhook_id INTEGER REFERENCES webhooks(id),
  status VARCHAR(50) NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  response_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Cache & Queue (Redis)

**Usage:**
- Cache active webhooks by event type (key: `webhooks:<event_type>`)
- Store retry queue for failed deliveries
- System statistics and health indicators
- Session management (future)

**Caching Strategy:**
- Webhooks cached for 1 hour
- Cache invalidation on webhook CRUD operations
- Automatic fallback to database on cache miss

## Event Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Event Ingested                                           │
│    POST /api/events                                         │
│    { event_id, type, payload }                             │
└──────────────────────────┬──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Database Storage (with idempotency)                     │
│    - Check if event_id exists                              │
│    - If new: INSERT and return event                       │
│    - If duplicate: return null (ignored)                  │
└──────────────────────────┬──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Find Subscribers                                         │
│    - Check Redis cache for webhooks                        │
│    - If cache miss: Query database                         │
│    - Cache results for future use                          │
└──────────────────────────┬──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Deliver to Webhooks                                      │
│    For each webhook:                                        │
│    - Generate HMAC signature                                │
│    - POST to target URL with headers                        │
│    - Log delivery attempt                                   │
│    - Handle timeouts and errors                             │
└──────────────────────────┬──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Retry Logic (if failed)                                  │
│    - Add to retry queue in Redis                            │
│    - Scheduled retry with exponential backoff               │
│    - Max 3 attempts                                         │
│    - Manual retry available from UI                         │
└─────────────────────────────────────────────────────────────┘
```

## Security Model

### 1. HMAC Signature Verification

Every webhook delivery includes a signature header:

```
x-algohire-signature: <base64-encoded-hmac-sha256>
```

**Verification Process:**
1. Recipient extracts signature from header
2. Calculate HMAC-SHA256 of request body using stored secret
3. Compare calculated signature with received signature
4. Only process if signatures match

### 2. Idempotency

Events are identified by unique `event_id`:
- Prevents duplicate event processing
- Allows safe retries
- Enables event replay

### 3. Access Control (Future)

Planned features:
- API key authentication
- Role-based access control
- Rate limiting per client
- IP whitelisting

## Performance Optimizations

### 1. Redis Caching
- Webhook subscriptions cached for fast lookup
- Reduces database queries
- 1-hour TTL with manual invalidation

### 2. Connection Pooling
- PostgreSQL connection pool (max 20 connections)
- Connection reuse for better throughput

### 3. Async Processing
- Webhook delivery non-blocking
- Immediate API response
- Background job processing

### 4. Database Indexes
- Index on `event_id` for fast duplicate detection
- Index on `event_type` for filtering
- Index on delivery log status for analytics

## Scalability Considerations

### Current Architecture (Single Instance)
- Suitable for ~1000 events/minute
- Vertical scaling ready

### Future Horizontal Scaling
- Stateless API servers
- Shared Redis instance
- PostgreSQL read replicas
- Load balancer for distribution

### High Availability
- Database replication
- Redis Sentinel or Cluster
- Health checks and automatic failover
- Circuit breakers for external calls

## Monitoring & Observability

### Current Monitoring
- Health check endpoints
- Delivery success/failure tracking
- System statistics dashboard

### Future Enhancements
- Prometheus metrics
- Grafana dashboards
- Distributed tracing (OpenTelemetry)
- Error tracking (Sentry)
- Performance profiling
- Alert management

## Deployment

### Docker Compose (Development)
- All services in single stack
- Automatic health checks
- Volume persistence
- Easy local development

### Production Deployment
1. **Container Registry:** Docker Hub / ECR
2. **Orchestration:** Kubernetes or Docker Swarm
3. **CI/CD:** GitHub Actions / GitLab CI
4. **Infrastructure:** AWS / GCP / Azure
5. **Reverse Proxy:** Nginx / Traefik
6. **SSL/TLS:** Let's Encrypt certificates

### Environment Variables
- Database credentials
- Redis connection details
- JWT secrets (future)
- External service URLs
- Feature flags

## Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- HMAC signature generation

### Integration Tests
- API endpoint testing
- Database operations
- Redis cache behavior

### E2E Tests
- Full event flow
- Webhook delivery
- Retry mechanism
- UI interactions

## Development Workflow

1. **Setup:** `docker-compose up -d`
2. **Development:** `npm run dev` (auto-reload)
3. **Testing:** Use Postman or curl for API testing
4. **Debugging:** Check logs in Docker containers
5. **Deployment:** Build and push Docker images

## Future Roadmap

See README.md "Future Enhancements" section for detailed roadmap including:
- Advanced features
- Performance optimizations
- Monitoring improvements
- Security enhancements
- Scalability features

