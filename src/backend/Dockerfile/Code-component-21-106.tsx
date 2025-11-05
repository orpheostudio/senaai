# 🌙 Yume Chatbot - Backend Dockerfile
# Multi-stage build for optimized production container

# ===== DEVELOPMENT STAGE =====
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    dumb-init

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=development

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run db:generate

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# ===== BUILD STAGE =====
FROM node:18-alpine AS build

WORKDIR /app

# Install system dependencies for building
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run db:generate

# Build TypeScript
RUN npm run build

# ===== PRODUCTION STAGE =====
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S yume -u 1001

WORKDIR /app

# Copy built application from build stage
COPY --from=build --chown=yume:nodejs /app/dist ./dist
COPY --from=build --chown=yume:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=yume:nodejs /app/package.json ./package.json
COPY --from=build --chown=yume:nodejs /app/prisma ./prisma

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/tmp && \
    chown -R yume:nodejs /app/logs /app/uploads /app/tmp

# Switch to non-root user
USER yume

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

# ===== LABELS =====
LABEL maintainer="Yume AI Team <dev@yume-ai.com>"
LABEL version="1.0.0"
LABEL description="Yume Chatbot Backend - AI-powered conversation service"
LABEL org.opencontainers.image.title="Yume Backend"
LABEL org.opencontainers.image.description="Backend service for Yume AI Chatbot"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Yume AI"
LABEL org.opencontainers.image.licenses="MIT"