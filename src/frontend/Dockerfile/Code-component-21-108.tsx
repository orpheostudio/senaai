# 🌙 Yume Chatbot - Frontend Dockerfile
# Multi-stage build for optimized production container

# ===== DEVELOPMENT STAGE =====
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5173 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ===== BUILD STAGE =====
FROM node:18-alpine AS build

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Set build-time environment variables
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_APP_VERSION
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Build application
RUN npm run build

# ===== PRODUCTION STAGE =====
FROM nginx:alpine AS production

# Install additional packages
RUN apk add --no-cache \
    curl \
    dumb-init

# Create nginx user
RUN addgroup -g 1001 -S nginx-custom && \
    adduser -S yume -u 1001 -G nginx-custom

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build --chown=yume:nginx-custom /app/dist /usr/share/nginx/html

# Create necessary directories
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R yume:nginx-custom /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html

# Copy custom error pages
COPY --chown=yume:nginx-custom error-pages /usr/share/nginx/html/error-pages

# Switch to non-root user
USER yume

# Environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]

# ===== NGINX CONFIGURATION =====
FROM production AS nginx-config

# Custom nginx.conf
COPY <<EOF /etc/nginx/nginx.conf
user yume;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;

    include /etc/nginx/conf.d/*.conf;
}
EOF

# Custom default.conf
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security
    server_tokens off;
    client_max_body_size 10M;

    # Enable gzip
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Error pages
    error_page 404 /error-pages/404.html;
    error_page 500 502 503 504 /error-pages/5xx.html;
}
EOF

# ===== LABELS =====
LABEL maintainer="Yume AI Team <dev@yume-ai.com>"
LABEL version="1.0.0"
LABEL description="Yume Chatbot Frontend - React SPA with Kawaii design"
LABEL org.opencontainers.image.title="Yume Frontend"
LABEL org.opencontainers.image.description="Frontend application for Yume AI Chatbot"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Yume AI"
LABEL org.opencontainers.image.licenses="MIT"