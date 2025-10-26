/**
 * In-Memory Storage for Webhook Event Relay
 * Replaces PostgreSQL and Redis with simple in-memory storage
 */

// In-memory data stores
export let events = [];
export let webhooks = [];
export let deliveryLogs = [];

// Auto-increment IDs
let nextEventId = 1;
let nextWebhookId = 1;
let nextLogId = 1;

/**
 * Events Storage
 */
export const eventsStore = {
  async create(eventId, type, payload) {
    // Check for duplicate event_id
    const existing = events.find(e => e.event_id === eventId);
    if (existing) {
      return null;
    }

    const event = {
      id: nextEventId++,
      event_id: eventId,
      type,
      payload,
      created_at: new Date(),
    };
    events.push(event);
    return event;
  },

  async getAll(limit = 50, offset = 0) {
    return events.slice(offset, offset + limit);
  },

  async getById(id) {
    return events.find(e => e.id === parseInt(id));
  },

  async getByType(eventType, limit = 50) {
    return events.filter(e => e.type === eventType).slice(0, limit);
  },
};

/**
 * Webhooks Storage
 */
export const webhooksStore = {
  async create(eventType, targetUrl, secret) {
    const webhook = {
      id: nextWebhookId++,
      event_type: eventType,
      target_url: targetUrl,
      secret,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    webhooks.push(webhook);
    return webhook;
  },

  async getAll() {
    return [...webhooks];
  },

  async getById(id) {
    return webhooks.find(w => w.id === parseInt(id));
  },

  async getByEventType(eventType) {
    return webhooks.filter(w => w.event_type === eventType && w.is_active);
  },

  async update(id, updates) {
    const index = webhooks.findIndex(w => w.id === parseInt(id));
    if (index === -1) return null;

    webhooks[index] = {
      ...webhooks[index],
      ...updates,
      updated_at: new Date(),
    };
    return webhooks[index];
  },

  async delete(id) {
    const index = webhooks.findIndex(w => w.id === parseInt(id));
    if (index === -1) return false;
    webhooks.splice(index, 1);
    return true;
  },

  async toggleStatus(id) {
    const webhook = await this.getById(id);
    if (!webhook) return null;
    return await this.update(id, { is_active: !webhook.is_active });
  },
};

/**
 * Delivery Logs Storage
 */
export const logsStore = {
  async create(eventId, webhookId, status, attemptCount, responseCode, errorMessage = null) {
    const log = {
      id: nextLogId++,
      event_id: eventId,
      webhook_id: webhookId,
      status,
      attempt_count: attemptCount,
      response_code: responseCode,
      error_message: errorMessage,
      created_at: new Date(),
      updated_at: new Date(),
    };
    deliveryLogs.push(log);
    return log;
  },

  async getByEventId(eventId) {
    return deliveryLogs.filter(log => log.event_id === parseInt(eventId));
  },

  async getAll(limit = 100, offset = 0) {
    return deliveryLogs.slice(offset, offset + limit);
  },

  async getStats() {
    const totalEvents = events.length;
    const totalWebhooks = webhooks.length;
    const activeWebhooks = webhooks.filter(w => w.is_active).length;
    const successfulDeliveries = deliveryLogs.filter(l => l.status === 'success').length;
    const failedDeliveries = deliveryLogs.filter(l => l.status === 'failed').length;

    return {
      events: { total: totalEvents },
      webhooks: { total: totalWebhooks, active: activeWebhooks },
      deliveries: { successful: successfulDeliveries, failed: failedDeliveries },
    };
  },
};

/**
 * Reset all data (useful for testing)
 */
export function resetData() {
  events = [];
  webhooks = [];
  deliveryLogs = [];
  nextEventId = 1;
  nextWebhookId = 1;
  nextLogId = 1;
  console.log('✅ In-memory storage reset');
}

