# Incident Management System (IMS)

A production-grade incident tracking system that ingests error signals,
deduplicates them using debounce logic, and manages the full incident
lifecycle with mandatory Root Cause Analysis.

## Live Demo

- Frontend: https://incmasys.netlify.app
- Backend API: https://ims-backend-yx2q.onrender.com
- Health Check: https://ims-backend-yx2q.onrender.com/health

## Architecture

```
Signal Sources (API failures, DB delays, Cache misses, Queue backups)
        ↓
Ingestion API (Rate limited - 100 req/min)
        ↓
Debounce Engine (10s window - 100 signals → 1 WorkItem)
        ↓
MongoDB Atlas
├── signals     → Raw audit log (every signal stored)
├── workitems   → Structured incidents (engineers work on these)
└── rcas        → Post-mortem records (written once, never changed)
        ↓
React Dashboard (Live feed, Incident detail, RCA form)
```

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | Node.js + Express | Async, non-blocking, fast |
| Database | MongoDB Atlas | Flexible schema, high write volume |
| Frontend | React + Vite | Component-based, fast builds |
| Rate Limiting | express-rate-limit | Protect against signal floods |
| Hosting (BE) | Render | Free Node.js hosting |
| Hosting (FE) | Netlify | Free React hosting |
| Container | Docker + Compose | One-command local setup |

## Design Patterns Used

- **Strategy Pattern** — SEVERITY_MAP swaps alert priority per component type
- **State Pattern** — VALID_TRANSITIONS enforces OPEN→INVESTIGATING→RESOLVED→CLOSED
- **Debounce Pattern** — 10s window collapses duplicate signals into one WorkItem

## How Backpressure is Handled

- Rate limiting blocks excess signals at API layer (max 100/min)
- In-memory debounce Map prevents duplicate DB writes
- Retry logic with exponential backoff handles temporary DB slowness
- Async/await throughout — Node.js event loop handles bursts without blocking

## Quick Demo (See It Working)

### Option 1: One command — no setup needed

**Windows PowerShell:**
```powershell
Invoke-WebRequest -Uri "https://ims-backend-yx2q.onrender.com/api/signals" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"componentId":"PAYMENT_API","type":"API_FAILURE","message":"Payment timeout"}'
```

**Mac/Linux:**
```bash
curl -X POST https://ims-backend-yx2q.onrender.com/api/signals \
  -H "Content-Type: application/json" \
  -d '{"componentId":"PAYMENT_API","type":"API_FAILURE","message":"Payment timeout"}'
```

Then open https://incmasys.netlify.app to see the incident appear.

### Option 2: Full simulator (7 signals across 4 components)
```bash
git clone https://github.com/YOUR_USERNAME/ims-project
cd ims-project/backend
npm install
node simulator.js
```

Then open https://incmasys.netlify.app

## Local Setup (Without Docker)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
MONGO_URI=your_mongodb_atlas_uri
PORT=5000
```

```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173

## Local Setup (With Docker)

### Prerequisites
- Docker Desktop installed and running

### Steps
```bash
git clone https://github.com/YOUR_USERNAME/ims-project
cd ims-project
```

Create root `.env`:
```
MONGO_URI=your_mongodb_atlas_uri
```

```bash
docker-compose up --build
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

```bash
# To stop
docker-compose down
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/signals | Ingest a signal |
| GET | /api/workitems | List all incidents |
| GET | /api/workitems/:id | Get incident detail |
| PATCH | /api/workitems/:id/status | Move to next status |
| POST | /api/workitems/:id/rca | Submit RCA and close |
| GET | /api/signals/:workItemId | Get signals for incident |
| GET | /health | System health check |

## Incident Lifecycle

```
OPEN → INVESTIGATING → RESOLVED → CLOSED
```

- CLOSED is blocked by the system if RCA is missing
- MTTR is auto-calculated from RCA timestamps
- All signals linked to one WorkItem via debounce

## Resilience Features

- Rate limiting — 100 signals/min max on ingestion API
- Retry logic — 3 attempts with exponential backoff (200ms, 400ms, 600ms)
- Health endpoint — GET /health returns uptime and signals processed
- Throughput metrics — signals/sec printed to console every 5 seconds

## Sample Signal Types

| Type | Severity | Example |
|---|---|---|
| DB_DELAY | P0 | MongoDB query took 8000ms |
| API_FAILURE | P1 | Payment API returned 500 |
| QUEUE_BACKUP | P1 | 5000 jobs pending |
| CACHE_MISS | P2 | Redis not responding |