/**
 * 🤖 Mistral AI Client Service
 * 
 * Comprehensive service for interacting with Mistral AI API
 * Features:
 * - Multiple model support
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern
 * - Token usage tracking
 * - Error handling and logging
 * - Rate limiting awareness
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger.js';
import { metricsService } from './metrics.js';

// Types
interface MistralConfig {
  apiKey: string;
  baseURL: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  stop?: string[];
  random_seed?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

class MistralClient {
  private client: AxiosInstance;
  private config: MistralConfig;
  private circuitBreaker: CircuitBreakerState;
  private readonly circuitBreakerThreshold = 5;
  private readonly circuitBreakerTimeout = 60000; // 1 minute

  constructor() {
    this.config = {
      apiKey: process.env.MISTRAL_API_KEY || '',
      baseURL: process.env.MISTRAL_BASE_URL || 'https://api.mistral.ai',
      timeout: Number(process.env.MISTRAL_TIMEOUT) || 30000,
      maxRetries: Number(process.env.MISTRAL_MAX_RETRIES) || 3,
      retryDelay: Number(process.env.MISTRAL_RETRY_DELAY) || 1000
    };

    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED'
    };

    if (!this.config.apiKey) {
      logger.error('❌ MISTRAL_API_KEY is required');
      throw new Error('Mistral API key is not configured');
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Yume-Chatbot/1.0.0'
      }
    });

    this.setupInterceptors();
    logger.info('🤖 Mistral AI client initialized');
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('🔄 Mistral API Request:', {
          url: config.url,
          method: config.method,
          headers: { ...config.headers, Authorization: '[REDACTED]' }
        });
        return config;
      },
      (error) => {
        logger.error('❌ Mistral API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('✅ Mistral API Response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });
        return response;
      },
      (error: AxiosError) => {
        logger.error('❌ Mistral API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  private async checkCircuitBreaker(): Promise<void> {
    const now = Date.now();

    switch (this.circuitBreaker.state) {
      case 'OPEN':
        if (now - this.circuitBreaker.lastFailureTime > this.circuitBreakerTimeout) {
          this.circuitBreaker.state = 'HALF_OPEN';
          logger.info('🔄 Circuit breaker: OPEN -> HALF_OPEN');
        } else {
          throw new Error('Circuit breaker is OPEN - Mistral AI service temporarily unavailable');
        }
        break;
      case 'HALF_OPEN':
        // Allow one request to test if service is back
        break;
      case 'CLOSED':
        // Normal operation
        break;
    }
  }

  private recordSuccess(): void {
    if (this.circuitBreaker.state === 'HALF_OPEN') {
      this.circuitBreaker.state = 'CLOSED';
      this.circuitBreaker.failures = 0;
      logger.info('✅ Circuit breaker: HALF_OPEN -> CLOSED');
    }
  }

  private recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failures >= this.circuitBreakerThreshold) {
      this.circuitBreaker.state = 'OPEN';
      logger.warn(`🔴 Circuit breaker: CLOSED -> OPEN (${this.circuitBreaker.failures} failures)`);
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      await this.checkCircuitBreaker();
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();

      if (attempt >= this.config.maxRetries) {
        logger.error(`❌ Mistral API: Max retries (${this.config.maxRetries}) exceeded`);
        throw error;
      }

      const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
      logger.warn(`⏳ Mistral API: Retry ${attempt}/${this.config.maxRetries} in ${delay}ms`);
      
      await this.sleep(delay);
      return this.retryWithBackoff(operation, attempt + 1);
    }
  }

  /**
   * Create chat completion
   */
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const startTime = Date.now();

    try {
      // Validate request
      if (!request.messages || request.messages.length === 0) {
        throw new Error('Messages array is required and cannot be empty');
      }

      // Set defaults
      const payload = {
        model: request.model || process.env.MISTRAL_MODEL || 'mistral-7b-instruct',
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2048,
        top_p: request.top_p ?? 0.9,
        stream: false, // We don't support streaming yet
        ...request
      };

      logger.info('🤖 Creating Mistral chat completion:', {
        model: payload.model,
        messageCount: payload.messages.length,
        temperature: payload.temperature,
        maxTokens: payload.max_tokens
      });

      const response = await this.retryWithBackoff(async () => {
        const { data } = await this.client.post<ChatCompletionResponse>('/v1/chat/completions', payload);
        return data;
      });

      const duration = Date.now() - startTime;

      // Record metrics
      await metricsService.recordEvent('chat.completion.success', {
        model: payload.model,
        duration,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      });

      logger.info('✅ Mistral chat completion successful:', {
        id: response.id,
        model: response.model,
        duration,
        usage: response.usage
      });

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      await metricsService.recordEvent('chat.completion.error', {
        model: request.model,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      logger.error('❌ Mistral chat completion failed:', {
        error: error instanceof Error ? error.message : error,
        duration,
        request: { ...request, messages: '[REDACTED]' }
      });

      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<any> {
    try {
      const response = await this.retryWithBackoff(async () => {
        const { data } = await this.client.get('/v1/models');
        return data;
      });

      logger.info('📋 Mistral models listed successfully');
      return response;

    } catch (error) {
      logger.error('❌ Failed to list Mistral models:', error);
      throw error;
    }
  }

  /**
   * Get model details
   */
  async getModel(modelId: string): Promise<any> {
    try {
      const response = await this.retryWithBackoff(async () => {
        const { data } = await this.client.get(`/v1/models/${modelId}`);
        return data;
      });

      logger.info(`📋 Mistral model ${modelId} details retrieved`);
      return response;

    } catch (error) {
      logger.error(`❌ Failed to get Mistral model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch (error) {
      logger.error('❌ Mistral health check failed:', error);
      return false;
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): CircuitBreakerState {
    return { ...this.circuitBreaker };
  }
}

// Singleton instance
export const mistralClient = new MistralClient();

// Helper functions for common operations
export async function generateChatResponse(
  messages: ChatMessage[],
  options: Partial<ChatCompletionRequest> = {}
): Promise<string> {
  const response = await mistralClient.createChatCompletion({
    messages,
    ...options
  });

  return response.choices[0]?.message?.content || '';
}

export async function generateSystemPrompt(
  systemMessage: string,
  userMessage: string,
  options: Partial<ChatCompletionRequest> = {}
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userMessage }
  ];

  return generateChatResponse(messages, options);
}