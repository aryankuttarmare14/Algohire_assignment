# Algohire Webhook Event Relay System

A production-quality webhook event relay system built for the Algohire Hackathon. This system receives internal events, stores them in PostgreSQL, and delivers them to subscribed external webhook endpoints with HMAC signature verification and automatic retry logic.

## 🏗️ Architecture

```
┌─────────────┐
│   Events    │
│   Source    │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         Backend API (Express.js)         │
│                                          │
│  ┌─────────────┐    ┌─────────────────┐ │
│  │ PostgreSQL  │    │  Redis Cache    │ │
│  │  Database   │    │  & Queue        │ │
│  └──────┬──────┘    └────────┬────────┘ │
│         │                   │           │
│         ▼                   ▼           │
│  ┌────────────────────────────────────┐ │
│  │   Webhook Delivery Service          │ │
│  │   - HMAC Signing                    │ │
│  │   - Retry Logic                     │ │
│  └────────────────────────────────────┘ │
└────────────┬────────────────────────────┘
             │
             ▼
      ┌──────────────┐
      │   External   │
      │   Webhooks   │
      └──────────────┘

┌──────────────────────────────────────────┐
│    Frontend Dashboard (React + ShadCN)   │
│  - Webhook Management                    │
│  - Event Logs                            │
│  - System Health Monitoring              │
└──────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** for persistent storage
- **Redis** for caching and queue management
- **BullMQ** for background job processing
- **HMAC-SHA256** for webhook signature verification

### Frontend
- **React** with Vite
- **ShadCN UI** components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication

## 📋 Features

- ✅ **Event Ingestion** - Receive events via REST API with idempotency
- ✅ **Webhook Management** - Subscribe to specific event types
- ✅ **Signature Verification** - HMAC-SHA256 signing for security
- ✅ **Automatic Retries** - 3 attempts with exponential backoff
- ✅ **Redis Caching** - Fast webhook lookup
- ✅ **Dashboard UI** - Full management interface
- ✅ **Delivery Logs** - Track all webhook deliveries
- ✅ **Health Monitoring** - Database and Redis status
- ✅ **Manual Retry** - Retry failed deliveries from UI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**
```bash
git clone <https://github.com/aryankuttarmare14/Algohire_assignment>
cd algohire_assignment
```

2. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3001
- Frontend on port 3000

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: See `backend/API_DOCUMENTATION.md`

4. **Seed sample data** (optional)
```bash
docker exec -it algohire-backend npm run seed
```

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create a `.env` file:
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=algohire_webhook
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
WEBHOOK_TIMEOUT=10000
MAX_RETRIES=3
RETRY_DELAY_MS=1000
```

4. **Start PostgreSQL and Redis**
```bash
# PostgreSQL
psql -U postgres -c "CREATE DATABASE algohire_webhook;"

# Redis (if not running)
redis-server
```

5. **Run database migrations and seed data**
```bash
# The database tables are created automatically on first run
npm start
```

6. **Seed sample data** (optional)
```bash
npm run seed
```

7. **Start the backend**
```bash
npm run dev  # Development with nodemon
# or
npm start    # Production
```

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Access the frontend**
Open http://localhost:3000 in your browser

## 📖 Usage Examples

### 1. Create a Webhook Subscription

**Via API:**
```bash
curl -X POST http://localhost:3001/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "job_created",
    "target_url": "https://your-webhook-url.com/hook"
  }'
```

**Via UI:**
1. Navigate to Webhooks page
2. Click "Add Webhook"
3. Enter event type and target URL
4. Click "Create"

### 2. Send an Event

**Via API:**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "event_001",
    "type": "job_created",
    "payload": {
      "job_id": "job_123",
      "title": "Senior Developer",
      "company": "Algohire"
    }
  }'
```

This will automatically trigger webhook delivery to all active subscribers.

### 3. Verify Webhook Signature

When your webhook receives a request, verify the signature:

```javascript
const crypto = require('crypto');

function verifyWebhook(req, secret) {
  const payload = JSON.stringify(req.body);
  const signature = req.headers['x-algohire-signature'];
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## 🗄️ Database Schema

### Events Table
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Webhooks Table
```sql
CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  target_url TEXT NOT NULL,
  secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Delivery Logs Table
```sql
CREATE TABLE delivery_logs (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  webhook_id INTEGER REFERENCES webhooks(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Security

### Webhook Signature Verification
Each webhook delivery includes an `x-algohire-signature` header with an HMAC-SHA256 signature. Recipients should verify this signature using the secret provided during webhook registration.

### Best Practices
- Store secrets securely
- Use HTTPS for webhook URLs
- Implement rate limiting
- Add authentication to API endpoints
- Monitor failed deliveries
- Set up alerts for system health

## 📊 Dashboard Features

### Dashboard Page
- System statistics (total events, webhooks, deliveries)
- Success/failure rates
- System health indicators

### Webhooks Page
- View all webhook subscriptions
- Add, edit, or delete webhooks
- Toggle webhook active status
- Filter by event type

### Event Logs Page
- View delivery history
- Filter by status (success/failed)
- Retry failed deliveries
- Detailed response information

### Settings Page
- Database health status
- Redis health status
- System configuration
- Performance metrics

## 🧪 Testing

### Test Webhook Endpoints
Use these public webhook testing services:
- https://httpbin.org/post
- https://webhook.site/

### Sample Event Types
- `job_created` - New job posted
- `candidate_updated` - Candidate profile updated
- `application_submitted` - New application received

## 🤝 Contributing

This project was built for the Algohire Hackathon. Contributions and feedback are welcome!

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

Built for Algohire Hackathon 2024

---

## 📞 Support

For issues or questions:
- Check the API documentation in `backend/API_DOCUMENTATION.md`
- Review the database schema above
- Examine the logs in the dashboard

**Happy Hacking!** 🚀

