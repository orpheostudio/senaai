/**
 * 🌙 Yume Chatbot - Main Server Entry Point
 * 
 * Modern Fastify server with:
 * - TypeScript support
 * - Mistral AI integration
 * - PostgreSQL with Prisma
 * - Redis caching
 * - WebSocket support
 * - Comprehensive logging
 * - Monitoring & metrics
 * - Security features
 */

import 'dotenv/config';
import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createRedisClient } from './config/redis.js';
import { setupSwagger } from './config/swagger.js';
import { setupSecurity } from './config/security.js';
import { setupLogging } from './config/logging.js';
import { registerRoutes } from './routes/index.js';
import { startCronJobs } from './services/cron.js';
import { initializeMetrics } from './services/metrics.js';
import { logger } from './utils/logger.js';
import type { FastifyInstance } from 'fastify';

// Environment variables with defaults
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Global instances
let server: FastifyInstance;
let prisma: PrismaClient;

/**
 * Initialize and configure Fastify server
 */
async function createServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: NODE_ENV === 'development' ? {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          colorize: true
        }
      }
    } : true,
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024, // 10MB
    keepAliveTimeout: 65000,
    connectionTimeout: 10000
  });

  // Initialize database
  prisma = new PrismaClient({
    log: NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty'
  });

  // Test database connection
  try {
    await prisma.$connect();
    logger.info('🗄️ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // Initialize Redis
  const redis = await createRedisClient();
  
  // Setup server configuration
  await setupLogging(fastify);
  await setupSecurity(fastify);
  await setupSwagger(fastify);

  // Add database and redis to fastify instance
  fastify.decorate('prisma', prisma);
  fastify.decorate('redis', redis);

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    try {
      // Check database
      await prisma.$queryRaw`SELECT 1`;
      
      // Check Redis
      await redis.ping();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: NODE_ENV,
        database: 'connected',
        redis: 'connected'
      };
    } catch (error) {
      reply.status(503);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Register all routes
  await registerRoutes(fastify);

  // Global error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    logger.error('🚨 Global error handler:', {
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      ip: request.ip
    });

    // Don't expose internal errors in production
    if (NODE_ENV === 'production' && !error.statusCode) {
      reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong on our end',
        timestamp: new Date().toISOString()
      });
    } else {
      reply.status(error.statusCode || 500).send({
        error: error.name || 'Error',
        message: error.message,
        timestamp: new Date().toISOString(),
        ...(NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  });

  // 404 handler
  fastify.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      timestamp: new Date().toISOString()
    });
  });

  return fastify;
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    server = await createServer();

    // Initialize background services
    await initializeMetrics();
    startCronJobs();

    // Start listening
    const address = await server.listen({ port: PORT, host: HOST });
    
    logger.info(`🌙 Yume Chatbot server running at ${address}`);
    logger.info(`📚 API Documentation: ${address}/docs`);
    logger.info(`💚 Health Check: ${address}/health`);
    
    // Log environment info
    logger.info('🔧 Environment:', {
      NODE_ENV,
      PORT,
      HOST,
      version: process.env.npm_package_version || '1.0.0'
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`📤 Received ${signal}, starting graceful shutdown...`);

  try {
    // Stop accepting new requests
    if (server) {
      await server.close();
      logger.info('🛑 HTTP server closed');
    }

    // Close database connections
    if (prisma) {
      await prisma.$disconnect();
      logger.info('🗄️ Database connections closed');
    }

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { server, prisma };