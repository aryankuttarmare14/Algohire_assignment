import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Event API endpoints
 */
export const eventAPI = {
  // Create a new event
  create: async (event) => {
    const response = await api.post('/api/events', event);
    return response.data;
  },

  // Get all events
  getAll: async (limit = 50, offset = 0) => {
    const response = await api.get('/api/events', { params: { limit, offset } });
    return response.data;
  },

  // Get event by ID
  getById: async (id) => {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  },

  // Get events by type
  getByType: async (type) => {
    const response = await api.get(`/api/events/type/${type}`);
    return response.data;
  },

  // Get delivery logs for an event
  getDeliveryLogs: async (id) => {
    const response = await api.get(`/api/events/${id}/delivery-logs`);
    return response.data;
  },
};

/**
 * Webhook API endpoints
 */
export const webhookAPI = {
  // Create a new webhook
  create: async (webhook) => {
    const response = await api.post('/api/webhooks', webhook);
    return response.data;
  },

  // Get all webhooks
  getAll: async () => {
    const response = await api.get('/api/webhooks');
    return response.data;
  },

  // Get webhook by ID
  getById: async (id) => {
    const response = await api.get(`/api/webhooks/${id}`);
    return response.data;
  },

  // Update webhook
  update: async (id, updates) => {
    const response = await api.put(`/api/webhooks/${id}`, updates);
    return response.data;
  },

  // Delete webhook
  delete: async (id) => {
    const response = await api.delete(`/api/webhooks/${id}`);
    return response.data;
  },

  // Toggle webhook status
  toggleStatus: async (id) => {
    const response = await api.patch(`/api/webhooks/${id}/toggle`);
    return response.data;
  },
};

/**
 * Dashboard API endpoints
 */
export const dashboardAPI = {
  // Get statistics
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },

  // Get system health
  getHealth: async () => {
    const response = await api.get('/api/dashboard/health');
    return response.data;
  },

  // Get recent logs
  getRecentLogs: async (limit = 50, offset = 0) => {
    const response = await api.get('/api/dashboard/logs', { params: { limit, offset } });
    return response.data;
  },

  // Retry a failed delivery
  retryDelivery: async (logId) => {
    const response = await api.post(`/api/dashboard/retry/${logId}`);
    return response.data;
  },
};

export default api;

