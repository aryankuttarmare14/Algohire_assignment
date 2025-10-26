import { eventsStore } from '../storage/memoryStorage.js';
import webhookDeliveryService from './webhookDeliveryService.js';

/**
 * Event Service
 * Handles event ingestion and processing
 */
class EventService {
  /**
   * Create a new event
   * Uses event_id for idempotency - prevents duplicate events
   */
  async createEvent(eventId, eventType, payload) {
    try {
      // Insert event (handle duplicate event_id)
      const event = await eventsStore.create(eventId, eventType, payload);

      // If event was created (not duplicate), deliver to webhooks
      if (event) {
        console.log(`📨 New event created: ${eventType} (${eventId})`);
        // Trigger webhook delivery (async)
        this.deliverEventAsync(event).catch(err => {
          console.error('Error delivering event:', err);
        });
      } else {
        console.log(`⚠️  Duplicate event ignored: ${eventId}`);
      }

      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Get all events with pagination
   */
  async getAllEvents(limit = 50, offset = 0) {
    return await eventsStore.getAll(limit, offset);
  }

  /**
   * Get event by ID
   */
  async getEventById(id) {
    return await eventsStore.getById(id);
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType, limit = 50) {
    return await eventsStore.getByType(eventType, limit);
  }

  /**
   * Deliver event to webhooks asynchronously
   */
  async deliverEventAsync(event) {
    try {
      await webhookDeliveryService.deliverEvent(event);
    } catch (error) {
      console.error('Error in async delivery:', error);
    }
  }

  /**
   * Get delivery logs for an event
   */
  async getDeliveryLogs(eventId) {
    const { logsStore, webhooks } = await import('../storage/memoryStorage.js');
    const logs = await logsStore.getByEventId(eventId);
    // Enrich with webhook data
    return logs.map(log => {
      const webhook = webhooks.find(w => w.id === log.webhook_id);
      return {
        ...log,
        target_url: webhook?.target_url,
        event_type: webhook?.event_type,
      };
    });
  }

  /**
   * Get all delivery logs
   */
  async getAllDeliveryLogs(limit = 100, offset = 0) {
    const { logsStore, events, webhooks } = await import('../storage/memoryStorage.js');
    const logs = await logsStore.getAll(limit, offset);
    // Enrich with event and webhook data
    return logs.map(log => {
      const event = events.find(e => e.id === log.event_id);
      const webhook = webhooks.find(w => w.id === log.webhook_id);
      return {
        ...log,
        event_type: event?.type,
        event_id: event?.event_id,
        target_url: webhook?.target_url,
      };
    });
  }

  /**
   * Get statistics for dashboard
   */
  async getStats() {
    const { logsStore } = await import('../storage/memoryStorage.js');
    return await logsStore.getStats();
  }
}

export default new EventService();

