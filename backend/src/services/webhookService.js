import { webhooksStore } from '../storage/memoryStorage.js';
import { redisHelper } from '../config/redis.js';
import crypto from 'crypto';

/**
 * Webhook Management Service
 * Handles CRUD operations for webhook subscriptions
 */
class WebhookService {
  /**
   * Create a new webhook subscription
   */
  async createWebhook(eventType, targetUrl, secret = null) {
    // Generate a secret if not provided
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

    const webhook = await webhooksStore.create(eventType, targetUrl, webhookSecret);

    // Invalidate cache for this event type
    await redisHelper.invalidateWebhookCache(eventType);

    return webhook;
  }

  /**
   * Get all webhooks
   */
  async getAllWebhooks() {
    return await webhooksStore.getAll();
  }

  /**
   * Get webhook by ID
   */
  async getWebhookById(id) {
    return await webhooksStore.getById(id);
  }

  /**
   * Get webhooks by event type
   */
  async getWebhooksByEventType(eventType) {
    return await webhooksStore.getByEventType(eventType);
  }

  /**
   * Update webhook
   */
  async updateWebhook(id, updates) {
    const webhook = await webhooksStore.update(id, updates);
    
    // Invalidate cache for this event type if it changed
    if (updates.event_type) {
      await redisHelper.invalidateWebhookCache(updates.event_type);
    } else if (webhook) {
      await redisHelper.invalidateWebhookCache(webhook.event_type);
    }

    return webhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(id) {
    // Get the webhook first to invalidate cache
    const webhook = await this.getWebhookById(id);
    
    if (webhook) {
      await webhooksStore.delete(id);
      await redisHelper.invalidateWebhookCache(webhook.event_type);
      return true;
    }
    return false;
  }

  /**
   * Toggle webhook active status
   */
  async toggleWebhookStatus(id) {
    return await webhooksStore.toggleStatus(id);
  }
}

export default new WebhookService();

