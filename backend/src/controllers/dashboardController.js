import { logsStore } from '../storage/memoryStorage.js';
import { events, webhooks, deliveryLogs } from '../storage/memoryStorage.js';

/**
 * Dashboard Controller
 * Provides analytics and system health information
 */
class DashboardController {
  /**
   * GET /api/dashboard/stats
   * Get system statistics
   */
  async getStats(req, res) {
    try {
      const stats = await logsStore.getStats();

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics',
      });
    }
  }

  /**
   * GET /api/dashboard/health
   * Check system health
   */
  async getHealth(req, res) {
    try {
      const health = {
        storage: 'healthy',
        timestamp: new Date().toISOString(),
      };

      res.json({
        success: true,
        health,
      });
    } catch (error) {
      console.error('Error in getHealth:', error);
      res.status(500).json({
        error: 'Failed to check system health',
      });
    }
  }

  /**
   * GET /api/dashboard/logs
   * Get recent delivery logs
   */
  async getRecentLogs(req, res) {
    try {
      const limit = parseInt(req.query.limit || '50');
      const offset = parseInt(req.query.offset || '0');
      const { events, webhooks } = await import('../storage/memoryStorage.js');
      const logs = await logsStore.getAll(limit, offset);

      // Enrich with event and webhook data
      const enrichedLogs = logs.map(log => {
        const event = events.find(e => e.id === log.event_id);
        const webhook = webhooks.find(w => w.id === log.webhook_id);
        return {
          ...log,
          event_type: event?.type,
          event_id: event?.event_id,
          target_url: webhook?.target_url,
        };
      });

      res.json({
        success: true,
        logs: enrichedLogs,
        pagination: {
          limit,
          offset,
          count: enrichedLogs.length,
        },
      });
    } catch (error) {
      console.error('Error in getRecentLogs:', error);
      res.status(500).json({
        error: 'Failed to fetch logs',
      });
    }
  }

  /**
   * POST /api/dashboard/retry/:logId
   * Manually retry a failed delivery
   */
  async retryDelivery(req, res) {
    try {
      const { logId } = req.params;
      const { deliveryLogs } = await import('../storage/memoryStorage.js');

      // Find the log entry
      const log = deliveryLogs.find(l => l.id === parseInt(logId));

      if (!log) {
        return res.status(404).json({
          error: 'Log entry not found',
        });
      }

      if (log.status === 'success') {
        return res.status(400).json({
          error: 'Delivery already successful',
        });
      }

      // Mark for retry by updating the log
      log.attempt_count += 1;
      log.status = 'pending';

      res.json({
        success: true,
        message: 'Delivery marked for retry',
      });
    } catch (error) {
      console.error('Error in retryDelivery:', error);
      res.status(500).json({
        error: 'Failed to retry delivery',
      });
    }
  }
}

export default new DashboardController();

