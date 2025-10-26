import webhookService from '../services/webhookService.js';

/**
 * Webhook Controller
 * Handles HTTP requests for webhook management
 */
class WebhookController {
  /**
   * POST /api/webhooks
   * Create a new webhook subscription
   */
  async createWebhook(req, res) {
    try {
      const { event_type, target_url, secret } = req.body;

      if (!event_type || !target_url) {
        return res.status(400).json({
          error: 'Missing required fields: event_type, target_url'
        });
      }

      const webhook = await webhookService.createWebhook(
        event_type,
        target_url,
        secret
      );

      res.status(201).json({
        success: true,
        webhook,
        message: 'Webhook subscription created successfully'
      });
    } catch (error) {
      console.error('Error in createWebhook:', error);
      res.status(500).json({
        error: 'Failed to create webhook',
        details: error.message
      });
    }
  }

  /**
   * GET /api/webhooks
   * Get all webhook subscriptions
   */
  async getAllWebhooks(req, res) {
    try {
      const webhooks = await webhookService.getAllWebhooks();

      res.json({
        success: true,
        webhooks,
        count: webhooks.length
      });
    } catch (error) {
      console.error('Error in getAllWebhooks:', error);
      res.status(500).json({
        error: 'Failed to fetch webhooks'
      });
    }
  }

  /**
   * GET /api/webhooks/:id
   * Get webhook by ID
   */
  async getWebhookById(req, res) {
    try {
      const { id } = req.params;
      const webhook = await webhookService.getWebhookById(id);

      if (!webhook) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }

      res.json({
        success: true,
        webhook
      });
    } catch (error) {
      console.error('Error in getWebhookById:', error);
      res.status(500).json({
        error: 'Failed to fetch webhook'
      });
    }
  }

  /**
   * PUT /api/webhooks/:id
   * Update webhook
   */
  async updateWebhook(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const webhook = await webhookService.updateWebhook(id, updates);

      if (!webhook) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }

      res.json({
        success: true,
        webhook,
        message: 'Webhook updated successfully'
      });
    } catch (error) {
      console.error('Error in updateWebhook:', error);
      res.status(500).json({
        error: 'Failed to update webhook'
      });
    }
  }

  /**
   * DELETE /api/webhooks/:id
   * Delete webhook
   */
  async deleteWebhook(req, res) {
    try {
      const { id } = req.params;
      const deleted = await webhookService.deleteWebhook(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }

      res.json({
        success: true,
        message: 'Webhook deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteWebhook:', error);
      res.status(500).json({
        error: 'Failed to delete webhook'
      });
    }
  }

  /**
   * PATCH /api/webhooks/:id/toggle
   * Toggle webhook active status
   */
  async toggleWebhookStatus(req, res) {
    try {
      const { id } = req.params;
      const webhook = await webhookService.toggleWebhookStatus(id);

      if (!webhook) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }

      res.json({
        success: true,
        webhook,
        message: 'Webhook status toggled successfully'
      });
    } catch (error) {
      console.error('Error in toggleWebhookStatus:', error);
      res.status(500).json({
        error: 'Failed to toggle webhook status'
      });
    }
  }
}

export default new WebhookController();

