# Multi-stage Dockerfile

# ============================================================================
# Stage 1: Dependencies Installation
# ============================================================================
FROM node:20-alpine AS deps
WORKDIR /node-app

# Copy dependency files
COPY package.json package-lock.json ./
# Install production dependencies
RUN npm ci --omit=dev

# ============================================================================
# Stage 2: Build Stage
# ============================================================================
FROM node:20-alpine AS build
WORKDIR /node-app
# Copy node_modules from deps stage
COPY --from=deps /node-app/node_modules ./node_modules
# Copy all files
COPY . .

# ============================================================================
# Stage 3: Production Runtime
# ============================================================================
FROM node:20-alpine AS runtime
WORKDIR /node-app

# Set production environment
ENV NODE_ENV=production

# Remove global npm modules to reduce image size
RUN rm -rf /usr/local/lib/node_modules

# Non-root user for security
RUN addgroup -S nodegrp && adduser -S nodeuser -G nodegrp

# Copy only the necessary files from build stage
COPY --from=build /node-app/package.json ./package.json
COPY --from=build /node-app/node_modules ./node_modules
COPY --from=build /node-app/src ./src
COPY --from=build /node-app/.env.example ./.env.example

# Switch to non-root user
USER nodeuser

# Expose the port of app
EXPOSE 3000

# Health check to ensure container is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/healthz', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "src/server.js"]
