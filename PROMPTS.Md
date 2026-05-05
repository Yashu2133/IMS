# Prompts, Planning and Build Strategy

## Overview
This project was built step by step with a clear understanding of
each component before moving to the next. Every design decision
was made consciously with real-world production systems in mind.

## Build Phases

### Phase 1 - Understanding
- Broke down the assignment into three core concepts:
  Signal, WorkItem, RCA
- Drew the complete architecture before writing any code
- Identified data separation strategy upfront:
  signals vs workitems vs rcas

### Phase 2 - Backend Core
- Node.js + Express server setup
- MongoDB Atlas connection
- Three Mongoose models with correct relationships
- Signal ingestion API with debounce logic
- WorkItem lifecycle with state machine enforcement
- RCA submission with MTTR auto-calculation

### Phase 3 - Frontend
- React + Vite setup
- Three components: IncidentList, IncidentDetail, RCAForm
- Single api/index.js for all axios calls
- Auto-refresh every 5 seconds (live feed)
- Status progression UI with RCA gate

### Phase 4 - Production Features
- express-rate-limit on ingestion endpoint
- Retry logic with exponential backoff for all DB writes
- Global throughput metrics every 5 seconds
- /health endpoint

### Phase 5 - Deployment
- Backend deployed on Render
- Frontend deployed on Netlify
- Environment variables configured per platform
- CORS updated for production URLs

### Phase 6 - Docker
- Dockerfile for backend and frontend
- docker-compose.yml for one-command startup
- .dockerignore files to exclude node_modules

## Key Design Decisions

### Why separate MongoDB collections?
Signals are write-heavy (millions), WorkItems are read-heavy
(dashboard polling), RCAs are write-once. Mixing them creates
performance and clarity problems.

### Why in-memory debounce instead of Redis?
MVP simplicity. Redis would be the production choice for
multi-server deployments. Known limitation documented.

### Why polling instead of WebSockets?
Simpler for MVP. 5-second delay acceptable for incident
management use case. WebSockets needed at scale with
many concurrent dashboard users.

### Why MongoDB over PostgreSQL?
Signal schema varies per type. High write volume.
Flexible document model suits the audit log pattern.
Trade-off: weaker transactions, acceptable for this use case.

### Why express-rate-limit over Nginx rate limiting?
Application-level control. Easier to configure per-route.
Nginx would be added in front for production deployments.

## Alternatives Considered

| Decision | Chosen | Alternative | Why not chosen |
|---|---|---|---|
| Debounce state | In-memory Map | Redis | MVP simplicity |
| Real-time UI | Polling 5s | WebSockets | Simpler for MVP |
| Signal buffer | Direct DB write | Kafka | No extra infrastructure |
| Database | MongoDB | PostgreSQL | Flexible schema needed |
| Auth | None | JWT | Out of scope for MVP |