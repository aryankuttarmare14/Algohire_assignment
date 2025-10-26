import axios from 'axios';
import { generateSignature } from '../utils/hmac.js';
import { webhooksStore } from '../storage/memoryStorage.js';
import { logsStore } from '../storage/memoryStorage.js';
import { redisHelper, CACHE_KEYS } from '../config/redis.js';

/**
 * Webhook Delivery Service
 * Handles sending webhook events to external endpoints with retry logic
 */
class WebhookDeliveryService {
  constructor() {
    this.timeout = parseInt(process.env.WEBHOOK_TIMEOUT || '10000');
    this.maxRetries = parseInt(process.env.MAX_RETRIES || '3');
  }

  /**
   * Get active webhooks for a specific event type
   * Checks in-memory cache first, falls back to storage
   */
  async getActiveWebhooks(eventType) {
    // Try cache first
    const cached = await redisHelper.getCachedWebhooks(eventType);
    if (cached) {
      return cached;
    }

    // Query storage
    const webhooks = await webhooksStore.getByEventType(eventType);
    
    // Cache the result
    await redisHelper.cacheWebhooks(eventType, webhooks);
    
    return webhooks;
  }

  /**
   * Deliver event to a single webhook
   * Includes HMAC signature in the request headers
   */
  async deliverToWebhook(event, webhook) {
    const payload = JSON.stringify(event.payload);
    const signature = generateSignature(payload, webhook.secret);

    try {
      const response = await axios.post(webhook.target_url, event.payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-algohire-signature': signature,
          'x-algohire-event-type': event.type,
          'x-algohire-event-id': event.event_id,
          'x-algohire-timestamp': new Date().toISOString(),
        },
        timeout: this.timeout,
      });

      // Log successful delivery
      await this.logDelivery(event.id, webhook.id, 'success', 1, response.status);
      
      return {
        success: true,
        status: response.status,
        webhookId: webhook.id,
      };
    } catch (error) {
      const statusCode = error.response?.status || 0;
      const errorMessage = error.message || 'Unknown error';

      // Log failed delivery
      await this.logDelivery(
        event.id,
        webhook.id,
        'failed',
        1,
        statusCode,
        errorMessage
      );

      return {
        success: false,
        status: statusCode,
        error: errorMessage,
        webhookId: webhook.id,
      };
    }
  }

  /**
   * Deliver event to all matching webhooks
   * Finds all subscribers for the event type and sends the event
   */
  async deliverEvent(event) {
    const webhooks = await this.getActiveWebhooks(event.type);
    
    if (webhooks.length === 0) {
      console.log(`No webhooks registered for event type: ${event.type}`);
      return { delivered: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
      webhooks.map(webhook => this.deliverToWebhook(event, webhook))
    );

    let delivered = 0;
    let failed = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        delivered++;
      } else {
        failed++;
        const webhook = webhooks[index];
        // Schedule retry for failed deliveries
        this.scheduleRetry(event, webhook, 1);
      }
    });

    return { delivered, failed };
  }

  /**
   * Retry a failed delivery
   * Implements exponential backoff
   */
  async retryDelivery(event, webhook, attempt) {
    if (attempt > this.maxRetries) {
      console.log(`Max retries reached for webhook ${webhook.id}`);
      return;
    }

    // Exponential backoff delay
    const delay = Math.pow(2, attempt - 1) * 1000;
    
    setTimeout(async () => {
      const result = await this.deliverToWebhook(event, webhook);
      
      if (!result.success && attempt < this.maxRetries) {
        // Schedule another retry
        this.scheduleRetry(event, webhook, attempt + 1);
      }
    }, delay);
  }

  /**
   * Schedule a retry by adding to Redis queue
   */
  async scheduleRetry(event, webhook, attempt) {
    await redisHelper.addToRetryQueue({
      event: JSON.stringify(event),
      webhook: JSON.stringify(webhook),
      attempt,
    });
  }

  /**
   * Log delivery attempt to storage
   */
  async logDelivery(eventId, webhookId, status, attemptCount, responseCode, errorMessage = null) {
    try {
      await logsStore.create(eventId, webhookId, status, attemptCount, responseCode, errorMessage);
    } catch (error) {
      console.error('Error logging delivery:', error);
    }
  }
}

export default new WebhookDeliveryService();

