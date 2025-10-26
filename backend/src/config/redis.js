/**
 * In-Memory Cache Interface
 * Replaces Redis with simple in-memory storage
 */

export const redis = {
  async ping() {
    return 'PONG';
  },
  
  async quit() {
    return 'OK';
  },
};

export const CACHE_KEYS = {
  WEBHOOKS: (eventType) => `webhooks:${eventType}`,
  RETRY_QUEUE: 'retry:queue',
  SYSTEM_STATS: 'system:stats',
};

/**
 * In-memory cache storage
 */
const cache = {};

export const redisHelper = {
  async cacheWebhooks(eventType, webhooks) {
    const key = CACHE_KEYS.WEBHOOKS(eventType);
    cache[key] = { data: webhooks, expiry: Date.now() + 3600000 };
  },

  async getCachedWebhooks(eventType) {
    const key = CACHE_KEYS.WEBHOOKS(eventType);
    const cached = cache[key];
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    delete cache[key];
    return null;
  },

  async invalidateWebhookCache(eventType) {
    const key = CACHE_KEYS.WEBHOOKS(eventType);
    delete cache[key];
  },

  async addToRetryQueue(data) {
    // In-memory retry queue (simple implementation)
    const key = CACHE_KEYS.RETRY_QUEUE;
    if (!cache[key]) {
      cache[key] = [];
    }
    cache[key].push({ ...data, timestamp: Date.now() });
  },

  async getFromRetryQueue() {
    const key = CACHE_KEYS.RETRY_QUEUE;
    if (!cache[key] || cache[key].length === 0) {
      return null;
    }
    return cache[key].shift();
  },
};
