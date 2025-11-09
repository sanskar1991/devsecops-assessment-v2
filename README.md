# devsecops-assessment-v2

**Node.js/Express Application** (`node-app/`) - A secure Express API with MongoDB

## Prerequisites

- Node.js >= 18.17
- MongoDB (running locally or accessible via connection string)
- npm

## Running the Application

### Option 1: Run Locally (Development)

1. Navigate to the node-app directory:
   ```bash
   cd node-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure MongoDB is running locally (default: `mongodb://localhost:27017/devsecops`)

4. (Optional) Create a `.env` file with custom configuration:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/devsecops
   NODE_ENV=development
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=100
   ```

5. Run the application:
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-reload)
   npm run dev
   ```

6. The application will be available at `http://localhost:3000`
   - Health check: `http://localhost:3000/healthz`
   - Readiness check: `http://localhost:3000/readyz`
   - API endpoints: `http://localhost:3000/api/items`

### Option 2: Run with Docker

1. Build the Docker image:
   ```bash
   cd node-app
   docker build -t node-express-app .
   ```

2. Run the container (ensure MongoDB is accessible):
   ```bash
   docker run -p 3000:3000 \
     -e MONGODB_URI=mongodb://host.docker.internal:27017/devsecops \
     node-express-app
   ```

   Or if using Docker Compose with MongoDB:
   
   ```bash
   cd node-app
   docker-compose up --build
   ```
   
   This will:
   - Start MongoDB container on port 27017
   - Build and start the Node.js application using multi-stage Dockerfile
   - Application available at `http://localhost:3000`
   - MongoDB data persisted in Docker volume
   
   **Stop services:**
   ```bash
   docker-compose down
   # Remove volumes (clears MongoDB data)
   docker-compose down -v
   ```
   
   **Run in detached mode:**
   ```bash
   docker-compose up -d --build
   ```
   
   **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Available Scripts (Node.js)

- `npm start` - Start the application in production mode
- `npm run dev` - Start the application in development mode with auto-reload
- `npm run lint` - Run ESLint
- `npm run health` - Check application health endpoint

## Environment Variables (Node.js)

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017/devsecops`)
- `NODE_ENV` - Environment mode (development/production)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds (default: 60000)
- `RATE_LIMIT_MAX` - Maximum requests per window (default: 100)

## Docker Compose Services

The `docker-compose.yml` file includes:

- **mongodb**: MongoDB 7.0 container
  - Port: 27017
  - Database: devsecops
  - Persistent volume: `mongodb_data`

- **app**: Node.js application container
  - Port: 3000
  - Multi-stage build (deps → build → runtime)
  - Non-root user for security
  - Health check endpoint: `/healthz`

## Dockerfile Details

The Dockerfile uses a multi-stage build approach:

1. **Stage 1 (deps)**: Installs production dependencies only
2. **Stage 2 (build)**: Prepares the application files
3. **Stage 3 (runtime)**: Final minimal image with only runtime requirements

This approach:
- Reduces final image size
- Improves security by excluding dev dependencies
- Uses non-root user for container security
- Includes health checks for container orchestration

## Notes

### Dependency Override

The `package.json` includes an override for `cross-spawn` to address a vulnerability:

```json
"overrides": {
  "cross-spawn": "7.0.5"
}
```

This was necessary because `eslint@8.57.1` depends on `cross-spawn@7.0.6` which had a vulnerability. The override pins it to version `7.0.5`.