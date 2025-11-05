/**
 * 🧪 Integration Tests - Chat Functionality
 * 
 * Tests the complete chat flow from frontend to backend
 * including authentication, message sending, and AI responses
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { io, type Socket } from 'socket.io-client';

// Test utilities
import { createTestServer } from '../utils/test-server';
import { createTestUser, cleanupTestData } from '../utils/test-data';
import { mockMistralResponse } from '../utils/mock-mistral';

// Types
interface TestUser {
  id: string;
  email: string;
  token: string;
}

describe('Chat Integration Tests', () => {
  let app: any;
  let request: supertest.SuperTest<supertest.Test>;
  let prisma: PrismaClient;
  let testUser: TestUser;
  let clientSocket: Socket;

  beforeAll(async () => {
    // Setup test server
    app = await createTestServer();
    request = supertest(app.server);
    prisma = app.prisma;

    // Start server
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    const port = (app.server.address() as any).port;

    // Setup WebSocket client
    clientSocket = io(`http://localhost:${port}`, {
      transports: ['websocket']
    });

    await new Promise((resolve) => {
      clientSocket.on('connect', resolve);
    });
  });

  afterAll(async () => {
    // Cleanup
    if (clientSocket) {
      clientSocket.close();
    }
    if (app) {
      await app.close();
    }
    if (prisma) {
      await cleanupTestData(prisma);
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    // Create fresh test user for each test
    testUser = await createTestUser(prisma);
  });

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'SecurePass123!',
        name: 'New User'
      };

      const response = await request
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: userData.email,
            name: userData.name,
            role: 'USER'
          },
          token: expect.any(String)
        }
      });

      expect(response.body.data.user.id).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should login existing user', async () => {
      const loginData = {
        email: testUser.email,
        password: 'TestPassword123!'
      };

      const response = await request
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: testUser.email,
            role: 'USER'
          },
          token: expect.any(String)
        }
      });
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword'
      };

      const response = await request
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials'
      });
    });

    it('should refresh token', async () => {
      const response = await request
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          token: expect.any(String),
          expiresAt: expect.any(String)
        }
      });
    });
  });

  describe('Chat Functionality', () => {
    it('should send a message and receive AI response', async () => {
      // Mock Mistral API response
      const mockResponse = mockMistralResponse({
        content: 'Olá! Como posso ajudar você hoje? 🌙',
        model: 'mistral-7b-instruct',
        usage: {
          prompt_tokens: 15,
          completion_tokens: 25,
          total_tokens: 40
        }
      });

      const messageData = {
        content: 'Olá, como você está?',
        conversationId: null // New conversation
      };

      const response = await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(messageData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          conversation: {
            id: expect.any(String),
            title: expect.any(String),
            status: 'ACTIVE'
          },
          userMessage: {
            id: expect.any(String),
            content: messageData.content,
            role: 'USER'
          },
          assistantMessage: {
            id: expect.any(String),
            content: expect.any(String),
            role: 'ASSISTANT',
            model: expect.any(String)
          },
          usage: {
            promptTokens: expect.any(Number),
            completionTokens: expect.any(Number),
            totalTokens: expect.any(Number)
          }
        }
      });

      // Verify conversation was created in database
      const conversation = await prisma.conversation.findUnique({
        where: { id: response.body.data.conversation.id },
        include: { messages: true }
      });

      expect(conversation).toBeTruthy();
      expect(conversation?.messages).toHaveLength(2); // User + Assistant
    });

    it('should continue existing conversation', async () => {
      // Create initial conversation
      const initialResponse = await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ content: 'Primeira mensagem' })
        .expect(200);

      const conversationId = initialResponse.body.data.conversation.id;

      // Send follow-up message
      const followUpResponse = await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          content: 'Segunda mensagem',
          conversationId
        })
        .expect(200);

      expect(followUpResponse.body.data.conversation.id).toBe(conversationId);

      // Verify messages count in database
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true }
      });

      expect(conversation?.messages).toHaveLength(4); // 2 pairs of user + assistant
    });

    it('should handle file upload in message', async () => {
      const testFile = Buffer.from('Test file content');

      const response = await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .field('content', 'Analise este arquivo por favor')
        .attach('file', testFile, 'test.txt')
        .expect(200);

      expect(response.body.data.userMessage.metadata).toMatchObject({
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: expect.any(String),
            mimeType: 'text/plain',
            size: expect.any(Number)
          })
        ])
      });
    });

    it('should regenerate assistant message', async () => {
      // Send initial message
      const initialResponse = await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ content: 'Conte uma piada' })
        .expect(200);

      const messageId = initialResponse.body.data.assistantMessage.id;

      // Regenerate response
      const regenerateResponse = await request
        .post(`/api/v1/chat/messages/${messageId}/regenerate`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(regenerateResponse.body).toMatchObject({
        success: true,
        data: {
          message: {
            id: expect.any(String),
            content: expect.any(String),
            role: 'ASSISTANT'
          }
        }
      });

      // Verify new message ID is different
      expect(regenerateResponse.body.data.message.id).not.toBe(messageId);
    });

    it('should get conversation history', async () => {
      // Create conversation with multiple messages
      const conversationResponse = await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ content: 'Primeira mensagem' });

      const conversationId = conversationResponse.body.data.conversation.id;

      await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ content: 'Segunda mensagem', conversationId });

      // Get history
      const historyResponse = await request
        .get(`/api/v1/chat/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(historyResponse.body).toMatchObject({
        success: true,
        data: {
          conversation: {
            id: conversationId,
            title: expect.any(String),
            status: 'ACTIVE'
          },
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'USER',
              content: expect.any(String)
            }),
            expect.objectContaining({
              role: 'ASSISTANT',
              content: expect.any(String)
            })
          ])
        }
      });

      expect(historyResponse.body.data.messages).toHaveLength(4);
    });

    it('should list user conversations', async () => {
      // Create multiple conversations
      await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ content: 'Conversa 1' });

      await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ content: 'Conversa 2' });

      // List conversations
      const listResponse = await request
        .get('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(listResponse.body).toMatchObject({
        success: true,
        data: {
          conversations: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              title: expect.any(String),
              status: 'ACTIVE',
              createdAt: expect.any(String),
              updatedAt: expect.any(String)
            })
          ]),
          pagination: {
            total: expect.any(Number),
            page: 1,
            pageSize: expect.any(Number),
            totalPages: expect.any(Number)
          }
        }
      });

      expect(listResponse.body.data.conversations.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('WebSocket Real-time Features', () => {
    it('should receive typing indicators', (done) => {
      clientSocket.emit('typing:start', {
        conversationId: 'test-conversation-id'
      });

      clientSocket.on('typing', (data) => {
        expect(data).toMatchObject({
          isTyping: true,
          userId: expect.any(String)
        });
        done();
      });
    });

    it('should receive real-time messages', (done) => {
      const testMessage = {
        id: 'test-message-id',
        content: 'Test real-time message',
        role: 'ASSISTANT',
        timestamp: new Date().toISOString()
      };

      clientSocket.on('message:received', (data) => {
        expect(data).toMatchObject(testMessage);
        done();
      });

      // Simulate message broadcast
      clientSocket.emit('message:send', testMessage);
    });

    it('should handle connection status', (done) => {
      expect(clientSocket.connected).toBe(true);

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized requests', async () => {
      const response = await request
        .post('/api/v1/chat')
        .send({ content: 'Test message' })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Unauthorized',
        message: expect.any(String)
      });
    });

    it('should handle empty message', async () => {
      const response = await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ content: '' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation Error',
        message: expect.stringContaining('content')
      });
    });

    it('should handle Mistral API errors gracefully', async () => {
      // Mock Mistral API error
      const mockError = new Error('Mistral API temporarily unavailable');
      mockMistralResponse(null, mockError);

      const response = await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ content: 'Test message' })
        .expect(503);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Service Unavailable',
        message: expect.stringContaining('temporarily unavailable')
      });
    });

    it('should handle rate limiting', async () => {
      // Send multiple requests quickly to trigger rate limiting
      const promises = Array(20).fill(null).map(() =>
        request
          .post('/api/v1/chat')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ content: 'Rate limit test' })
      );

      const responses = await Promise.allSettled(promises);
      const rateLimited = responses.some(
        (result) => result.status === 'fulfilled' && result.value.status === 429
      );

      expect(rateLimited).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const startTime = Date.now();
      
      const promises = Array(10).fill(null).map((_, index) =>
        request
          .post('/api/v1/chat')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ content: `Concurrent message ${index}` })
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time (adjust based on requirements)
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();

      const response = await request
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ content: 'Performance test message' })
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(5000); // 5 seconds max
      expect(response.body.data.assistantMessage.content).toBeTruthy();
    });
  });
});