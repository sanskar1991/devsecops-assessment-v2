# Node.js Application - DevSecOps Assessment

A secure Node.js/Express REST API application with MongoDB integration, designed with security best practices and DevSecOps principles.

## Overview

This is a production-ready Node.js application that demonstrates:
- Secure Express.js API with security middleware
- MongoDB integration with Mongoose
- Docker containerization with multi-stage builds
- Security hardening (non-root user, read-only filesystem, dropped capabilities)
- Health checks and graceful shutdown
- Rate limiting and input sanitization
- Structured logging

## Features

### Security
- **Helmet.js**: Security headers protection
- **Rate Limiting**: Configurable request rate limiting
- **MongoDB Injection Protection**: Input sanitization with `express-mongo-sanitize`
- **Non-root Container**: Runs as non-privileged user
- **Read-only Filesystem**: Container filesystem is read-only (with tmpfs for /tmp)
- **Dropped Capabilities**: All Linux capabilities dropped
- **No Privilege Escalation**: `no-new-privileges` security option

### Application Features
- RESTful API for managing items (CRUD operations)
- MongoDB connection with automatic retry logic
- Health check endpoints (`/healthz`, `/readyz`)
- Structured logging with Pino
- Request compression
- Graceful shutdown handling

## Prerequisites

- **Node.js**: >= 18.17
- **MongoDB**: 7.0+ (or use Docker Compose)
- **Docker**: For containerized deployment (optional)
- **npm**: For dependency management

## Quick Start

### Local Development (without Docker)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/devsecops
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=100
   ```

3. **Start MongoDB** (if not using Docker):
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

4. **Run the application**:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

5. **Test the application**:
   ```bash
   # Health check
   curl http://localhost:3000/healthz

   # Create an item
   curl -X POST http://localhost:3000/api/items \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Item", "description": "A test item"}'

   # Get all items
   curl http://localhost:3000/api/items
   ```

### Docker Compose (Recommended)

1. **Set up environment variables**:
   Create a `.env` file in the `node-app` directory:
   ```env
   COMPOSE_PROJECT_NAME=devsecops
   MONGO_ROOT_USERNAME=admin
   MONGO_ROOT_PASSWORD=changeme-secure-password
   APP_DB_NAME=devsecops
   APP_DB_USERNAME=app_user
   APP_DB_PASSWORD=changeme-app-password
   APP_DB_AUTHDB=devsecops
   APP_PORT=3000
   APP_IMAGE=ghcr.io/sanskar1991/devsecops-assessment-v2:latest
   ```

2. **Start the stack**:
   ```bash
   docker-compose up -d
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

4. **Stop the stack**:
   ```bash
   docker-compose down
   ```

## Project Structure

```
node-app/
├── src/
│   ├── app.js              # Express app setup and middleware
│   ├── server.js           # Application entry point, MongoDB connection
│   ├── config.js           # Configuration management
│   ├── models/
│   │   └── Item.js         # Mongoose model for items
│   └── routes/
│       └── items.js        # REST API routes for items
├── db-init/
│   └── app-user.js         # MongoDB initialization script
├── Dockerfile              # Multi-stage production Dockerfile
├── Dockerfile.dev          # Development Dockerfile
├── docker-compose.yml      # Production-like Docker Compose
├── docker-compose.dev.yml  # Development Docker Compose
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## API Endpoints

### Health Checks

- `GET /healthz` - Liveness probe endpoint
- `GET /readyz` - Readiness probe endpoint

### Items API

Base path: `/api/items`

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create a new item
  ```json
  {
    "name": "Item Name",
    "description": "Optional description"
  }
  ```
- `PUT /api/items/:id` - Update an item
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description"
  }
  ```
- `DELETE /api/items/:id` - Delete an item

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment (development/production) | `development` |
| `PORT` | Application port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/devsecops` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `60000` |
| `RATE_LIMIT_MAX` | Maximum requests per window | `100` |
| `APP_ENV` | Application environment | `development` |

### Docker Compose Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_ROOT_USERNAME` | MongoDB root username | Required |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | Required |
| `APP_DB_NAME` | Application database name | `devsecops` |
| `APP_DB_USERNAME` | Application database user | Required |
| `APP_DB_PASSWORD` | Application database password | Required |
| `APP_DB_AUTHDB` | Authentication database | `devsecops` |
| `APP_PORT` | Application port | `3000` |
| `APP_IMAGE` | Docker image name | `ghcr.io/sanskar1991/devsecops-assessment-v2:latest` |

## Docker

### Building the Image

```bash
# Build production image
docker build -t devsecops-app:latest .

# Build with specific tag
docker build -t ghcr.io/sanskar1991/devsecops-assessment-v2:v1.0.0 .
```

### Running the Container

```bash
# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://mongodb:27017/devsecops \
  -e NODE_ENV=production \
  --name devsecops-app \
  devsecops-app:latest
```

### Multi-stage Build

The Dockerfile uses a multi-stage build process:
1. **deps stage**: Installs production dependencies
2. **build stage**: Prepares the application
3. **runtime stage**: Minimal production image with non-root user

## Development

### Running in Development Mode

```bash
# Install dependencies
npm install

# Run with nodemon (auto-reload)
npm run dev
```

### Development Docker Compose

For a development-friendly setup:

```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up
```

This setup:
- Builds the image locally
- Uses development Dockerfile
- Exposes ports on localhost only
- Includes health checks

## Database Setup

### MongoDB Initialization

The application uses a MongoDB initialization script (`db-init/app-user.js`) that:
- Creates an application-scoped database user
- Grants read/write permissions on the application database
- Uses least-privilege principle

### Manual Database Setup

If not using Docker Compose, set up MongoDB manually:

```javascript
// Connect to MongoDB
mongosh mongodb://localhost:27017

// Switch to admin database
use admin

// Create root user (if not exists)
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: ["root"]
})

// Create application database and user
use devsecops
db.createUser({
  user: "app_user",
  pwd: "app-password",
  roles: [{ role: "readWrite", db: "devsecops" }]
})
```

## Security Features

### Application Security

1. **Helmet.js**: Sets various HTTP headers for security
2. **Rate Limiting**: Prevents abuse with configurable limits
3. **MongoDB Sanitization**: Prevents NoSQL injection attacks
4. **Input Validation**: Mongoose schema validation
5. **JSON Size Limit**: Limits request body size to 1MB

### Container Security

1. **Non-root User**: Container runs as `nodeuser` (UID 10001)
2. **Read-only Filesystem**: Root filesystem is read-only
3. **Temporary Filesystem**: `/tmp` mounted as tmpfs with noexec, nosuid
4. **Dropped Capabilities**: All Linux capabilities dropped
5. **No Privilege Escalation**: `no-new-privileges` enabled
6. **Minimal Base Image**: Uses Alpine Linux for smaller attack surface

## Logging

The application uses structured logging with Pino:
- JSON-formatted logs
- Configurable log levels
- HTTP request logging with `pino-http`
- Combined with Morgan for HTTP access logs

## Health Checks

### Liveness Probe (`/healthz`)
- Returns 200 OK if the application is running
- Used by Kubernetes/Docker to determine if container should be restarted

### Readiness Probe (`/readyz`)
- Returns 200 OK if the application is ready to serve traffic
- Used by Kubernetes/Docker to determine if traffic should be routed to the pod

### Docker Health Check

The Dockerfile includes a health check:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/healthz', ...)"
```

## Graceful Shutdown

The application handles graceful shutdown:
- Listens for `SIGTERM` and `SIGINT` signals
- Closes HTTP server gracefully
- Closes MongoDB connection
- Exits cleanly

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3000/healthz

# Create item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "description": "Test item"}'

# Get all items
curl http://localhost:3000/api/items

# Get item by ID
curl http://localhost:3000/api/items/<item-id>

# Update item
curl -X PUT http://localhost:3000/api/items/<item-id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated", "description": "Updated item"}'

# Delete item
curl -X DELETE http://localhost:3000/api/items/<item-id>
```

### Health Check Script

```bash
npm run health
```

## Troubleshooting

### Application Won't Start

1. **Check MongoDB connection**:
   ```bash
   # Test MongoDB connection
   mongosh mongodb://localhost:27017
   ```

2. **Check environment variables**:
   ```bash
   # Verify .env file exists and has correct values
   cat .env
   ```

3. **Check logs**:
   ```bash
   # View application logs
   docker-compose logs app
   ```

### MongoDB Connection Issues

1. **Verify MongoDB is running**:
   ```bash
   docker-compose ps mongodb
   ```

2. **Check MongoDB logs**:
   ```bash
   docker-compose logs mongodb
   ```

3. **Test connection string**:
   ```bash
   mongosh "mongodb://app_user:password@localhost:27017/devsecops?authSource=devsecops"
   ```

### Container Issues

1. **Check container status**:
   ```bash
   docker ps -a
   ```

2. **View container logs**:
   ```bash
   docker logs devsecops-app
   ```

3. **Inspect container**:
   ```bash
   docker inspect devsecops-app
   ```

## Production Deployment

### Kubernetes

See the [k8s/README.md](../k8s/README.md) for Kubernetes deployment instructions.

### Docker Compose Production

1. **Set production environment variables**
2. **Use production image from registry**
3. **Enable health checks**
4. **Configure resource limits**
5. **Set up logging aggregation**

### Best Practices

1. **Secrets Management**: Use external secret management (not .env files)
2. **Image Scanning**: Scan images for vulnerabilities
3. **Resource Limits**: Set appropriate CPU/memory limits
4. **Monitoring**: Set up application monitoring and alerting
5. **Backup**: Configure MongoDB backups
6. **SSL/TLS**: Use HTTPS in production
7. **Network Policies**: Restrict network access

## Dependencies

### Production Dependencies

- `express`: Web framework
- `mongoose`: MongoDB ODM
- `helmet`: Security middleware
- `express-rate-limit`: Rate limiting
- `express-mongo-sanitize`: MongoDB injection protection
- `compression`: Response compression
- `morgan`: HTTP request logger
- `pino`: Fast JSON logger
- `pino-http`: Pino HTTP logger
- `dotenv`: Environment variable management

### Development Dependencies

- `nodemon`: Auto-reload for development

## License

This project is part of a DevSecOps assessment.

## Contributing

This is an assessment project. For questions or issues, please refer to the project maintainer.

