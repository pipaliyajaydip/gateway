# Microservices API Gateway

[![Node.js](https://img.shields.io/badge/node-%3E%3D22.14.0-green)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/express-5.2.1-blue)](https://expressjs.com)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)

A high-performance, production-ready API Gateway built with Express.js that orchestrates communication across a microservices architecture. Features intelligent request routing, Redis-backed rate limiting, security hardening, and multi-process clustering for optimal scalability.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisit](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Docker & Deployment](#docker--deployment)
- [Middleware & Security](#middleware--security)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Capabilities

- **Intelligent Request Routing** - Reverse proxy for microservices with dynamic route configuration
- **Rate Limiting** - Redis-backed token bucket algorithm protecting endpoints from abuse
- **Security First** - Helmet.js for HTTP security headers, JWT support, input validation
- **Health Monitoring** - Dedicated health check endpoints for service discovery and load balancer integration
- **Process Clustering** - Multi-worker architecture maximizing CPU utilization
- **Circuit Breaker Pattern** - Opossum integration for graceful failure handling
- **Request Logging** - Morgan HTTP request logging for observability
- **Request Proxying** - http-proxy-middleware for transparent microservice communication

### Non-Functional Benefits

- Zero-downtime deployments with graceful shutdown
- Horizontal scalability through Docker orchestration
- Redis connection resilience with automatic reconnection
- Environment-based configuration with validation
- Comprehensive error handling and logging

## Architecture

### High-Level Overview

```
┌─────────────────┐
│   Client        │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────────────────────────────┐
│     API Gateway (Express.js)            │
│  ┌─────────────────────────────────┐   │
│  │  Helmet (Security Headers)      │   │
│  │  CORS / Cookie Parser           │   │
│  │  Rate Limiter (Redis)           │   │
│  │  Request Logger (Morgan)        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Route:  GET /api/health/ping   │   │
│  │  Route:  /users/* ──────────┐   │   │
│  └────────────────────────┬────┘   │   │
└─────────────────────────────┼───────────┘
         │                    │
         │                    ▼
         │            ┌──────────────────┐
         ▼            │  User Service    │
    Response         │  (Microservice)  │
                     └──────────────────┘
         
    ┌────────────────────────────┐
    │   Redis                    │
    │ (Rate Limit Store)         │
    └────────────────────────────┘
```

### Project Structure

```
gateway/
├── server/
│   ├── app.js                 # Main application entry point
│   ├── Dockerfile             # Container image definition
│   ├── package.json           # Dependencies & scripts
│   ├── eslint.config.js       # Code quality rules
│   ├── config/
│   │   ├── env.js             # Environment configuration loader
│   │   └── redis.client.js    # Redis connection manager
│   ├── controller/
│   │   └── health.controller.js  # Health check logic
│   ├── middleware/
│   │   └── rateLimiter.js     # Rate limiting middleware
│   └── routes/
│       ├── route.js           # Main router & microservice proxies
│       └── health.route.js    # Health check endpoints
├── docker-compose.yml         # Local development orchestration
├── README.md                  # This file
└── LICENSE                    # ISC License
```

## Prerequisites

### System Requirements

- **Node.js**: v22.14.0 or higher
- **npm**: v10.x or higher
- **Redis**: v6.0+ (for rate limiting)
- **Docker** (optional): For containerized deployment

### Environment Dependencies

- Redis server (local or remote)
- Upstream microservices (configured via environment variables)

## Quick Start

### Local Development

1. **Clone and Navigate**
   ```bash
   cd gateway
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Copy and edit the environment file
   cp .env.example .env.development
   # Edit with your local settings
   ```

4. **Start Redis** (if using local instance)
   ```bash
   redis-server
   # or using Docker:
   docker run -d -p 6379:6379 redis:latest
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   The gateway will start on `http://localhost:5001` with hot-reload enabled.

### Docker Deployment

1. **Using Docker Compose** (includes Redis)
   ```bash
   docker-compose up -d
   ```

2. **Using Docker Alone**
   ```bash
   docker build -t api-gateway -f server/Dockerfile .
   docker run -p 5001:5001 \
     -e REDIS_HOST=redis \
     -e REDIS_PORT=6379 \
     -e USER_SERVICE_URL=http://user-service:3000 \
     api-gateway
   ```

## Configuration

### Environment Variables

Create a `.env.development` or `.env.production` file in the project root:

```env
# Server Configuration
NODE_ENV=development
PORT=5001
WORKER_PROCESSES=4

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                # Leave empty if no password
REDIS_DB=0
REDIS_RECONNECT_INTERVAL=5000
REDIS_MAX_RETRIES=10

# Rate Limiting
RATE_LIMIT_WINDOW=900          # Time window in seconds (15 minutes)
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window

# Microservices URLs
USER_SERVICE_URL=http://localhost:3001

# JWT Configuration (for future implementation)
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# Logging
LOG_LEVEL=info                 # debug, info, warn, error
MORGAN_FORMAT=combined         # combined, short, dev
```

### Configuration Loader

The `server/config/env.js` validates all required environment variables on startup. Missing critical variables will prevent the application from starting.

## API Endpoints

### Health Check

**Endpoint**: `GET /api/health/ping`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2026-03-28T10:30:45.123Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

Used for:
- Kubernetes liveness probes
- Load balancer health checks
- Service discovery validation

### User Service Proxy

**Prefix**: `/users/*`

All requests matching `/users/*` are proxied to the configured `USER_SERVICE_URL` microservice:

```
GET  /users/                    → USER_SERVICE_URL/
GET  /users/:id                 → USER_SERVICE_URL/:id
POST /users/                    → USER_SERVICE_URL/
PUT  /users/:id                 → USER_SERVICE_URL/:id
DELETE /users/:id               → USER_SERVICE_URL/:id
```

**Rate Limiting**: Applied to all routes (See [Rate Limiting](#rate-limiting-configuration))

### Rate Limiting Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1648536645
```

## Development

### Available Scripts

```bash
# Start development server with hot-reload
npm run dev

# Start production server
npm start

# Run code linting
npm run lint

# Fix linting issues (auto-format)
npm run lint:fix

# Production build
npm run build
```

### Code Quality

This project uses **ESLint** with strict rules. Run before committing:

```bash
npm run lint:fix
```

Configuration: `eslint.config.js`

### Adding New Microservice Routes

1. **Update Environment Variables**
   ```env
   NEW_SERVICE_URL=http://localhost:3002
   ```

2. **Modify** `server/routes/route.js`
   ```javascript
   import { createProxyMiddleware } from 'http-proxy-middleware';
   
   router.use(
     '/new-service',
     createProxyMiddleware({
       target: process.env.NEW_SERVICE_URL,
       changeOrigin: true,
       pathRewrite: { '^/new-service': '' }
     })
   );
   ```

3. **Test** the new route locally

4. **Deploy** via Docker

## Docker & Deployment

### Build Docker Image

```bash
docker build -t api-gateway:latest -f server/Dockerfile .
```

### Docker Compose (Complete Stack)

The included `docker-compose.yml` starts both Gateway and Redis:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api-gateway

# Stop services
docker-compose down
```

### Production Considerations

1. **Multi-Stage Builds**: Reduce image size using Dockerfile best practices
2. **Resource Limits**: Set memory and CPU limits in orchestration
3. **Health Checks**: Leverage the `/api/health/ping` endpoint
4. **Secrets Management**: Use Docker secrets or external secret managers (Vault, K8s secrets)
5. **Environment Variables**: Load from secure configuration systems

### Kubernetes Deployment Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: api-gateway:latest
        ports:
        - containerPort: 5001
        env:
        - name: REDIS_HOST
          value: redis-service
        - name: PORT
          value: "5001"
        livenessProbe:
          httpGet:
            path: /api/health/ping
            port: 5001
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/health/ping
            port: 5001
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Middleware & Security

### Request Processing Pipeline

1. **Helmet** - Security headers (XSS protection, HSTS, etc.)
2. **express.json()** - JSON body parsing
3. **cookie-parser** - Cookie handling
4. **morgan** - HTTP request logging
5. **rate-limiter** - Rate limiting check (Redis-backed)
6. **Routes** - Actual request handling

### Rate Limiting Configuration

Located in `server/middleware/rateLimiter.js`:

- **Algorithm**: Token bucket
- **Storage**: Redis
- **Window**: 15 minutes (configurable via `RATE_LIMIT_WINDOW`)
- **Limit**: 100 requests (configurable via `RATE_LIMIT_MAX_REQUESTS`)

**Behavior**:
- Exceeded limit → 429 Too Many Requests
- Response includes reset time in `X-RateLimit-Reset` header

### Security Features

| Feature | Implementation |
|---------|-----------------|
| HTTP Headers | Helmet.js |
| CORS | Configured in app.js |
| Input Validation | Body parser size limits |
| Rate Limiting | Redis-based throttling |
| JWT Ready | Config structure in place |
| Secure Cookies | httpOnly & secure flags |

## Monitoring & Health Checks

### Health Check Endpoint

- **Path**: `GET /api/health/ping`
- **Purpose**: Service availability verification
- **Frequency**: Every 30 seconds (typical probe interval)

### Logging

Requests are logged via **Morgan**:

```
[timestamp] METHOD /path HTTP/status responseTime
```

Configure log level via `LOG_LEVEL` environment variable.

### Metrics & Observability

To integrate with monitoring systems (Prometheus, DataDog, etc.):

1. Add `prom-client` for metrics exposure
2. Create endpoints like `/metrics` for Prometheus scraping
3. Log structured JSON for log aggregation services

## Troubleshooting

### Common Issues

**Issue**: "ECONNREFUSED: Connection refused" (Redis)
```
Solution: Verify Redis is running and REDIS_HOST/REDIS_PORT are correct
Check: redis-cli ping
```

**Issue**: "Port 5001 is already in use"
```
Solution: Change PORT in .env or kill existing process
Windows: netstat -ano | findstr :5001
Linux: lsof -i :5001
```

**Issue**: "Rate limit not working"
```
Solution: Verify Redis connection and RATE_LIMIT_MAX_REQUESTS value
Check logs: npm run dev (look for Redis connection messages)
```

**Issue**: "Upstream microservice returns 502 Bad Gateway"
```
Solution: Verify microservice URL is correct and service is running
Test: curl http://localhost:3001/health
Check environment variable: USER_SERVICE_URL
```

### Debug Mode

Enable detailed logging:

```bash
DEBUG=* npm run dev
LOG_LEVEL=debug npm run dev
```

## Contributing

1. **Code Style**: Run `npm run lint:fix` before committing
2. **Testing**: Maintain existing test coverage
3. **Branch Strategy**: Feature branches from `main`
4. **Commit Messages**: Use conventional commits format
   ```
   feat: add caching middleware
   fix: resolve rate limiter timeout
   docs: update API endpoint documentation
   ```
5. **Pull Requests**: Include description of changes

## License

ISC - See [LICENSE](LICENSE) file for details

## Support

- **Issues**: Open GitHub issues for bug reports and feature requests
- **Documentation**: See [Architecture](#architecture) and [Configuration](#configuration) sections
- **Security**: For security vulnerabilities, contact maintainers privately