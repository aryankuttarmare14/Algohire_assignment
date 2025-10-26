import eventService from '../services/eventService.js';

/**
 * Event Controller
 * Handles HTTP requests for event operations
 */
class EventController {
  /**
   * POST /api/events
   * Create a new event and trigger webhook deliveries
   */
  async createEvent(req, res) {
    try {
      const { event_id, type, payload } = req.body;

      if (!event_id || !type || !payload) {
        return res.status(400).json({
          error: 'Missing required fields: event_id, type, payload'
        });
      }

      const event = await eventService.createEvent(event_id, type, payload);

      if (event) {
        res.status(201).json({
          success: true,
          event,
          message: 'Event created and queued for delivery'
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Duplicate event ignored',
          event: null
        });
      }
    } catch (error) {
      console.error('Error in createEvent:', error);
      res.status(500).json({
        error: 'Failed to create event',
        details: error.message
      });
    }
  }

  /**
   * GET /api/events
   * Get all events with pagination
   */
  async getAllEvents(req, res) {
    try {
      const limit = parseInt(req.query.limit || '50');
      const offset = parseInt(req.query.offset || '0');

      const events = await eventService.getAllEvents(limit, offset);

      res.json({
        success: true,
        events,
        pagination: {
          limit,
          offset,
          count: events.length
        }
      });
    } catch (error) {
      console.error('Error in getAllEvents:', error);
      res.status(500).json({
        error: 'Failed to fetch events'
      });
    }
  }

  /**
   * GET /api/events/:id
   * Get event by ID
   */
  async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await eventService.getEventById(id);

      if (!event) {
        return res.status(404).json({
          error: 'Event not found'
        });
      }

      res.json({
        success: true,
        event
      });
    } catch (error) {
      console.error('Error in getEventById:', error);
      res.status(500).json({
        error: 'Failed to fetch event'
      });
    }
  }

  /**
   * GET /api/events/type/:type
   * Get events by type
   */
  async getEventsByType(req, res) {
    try {
      const { type } = req.params;
      const limit = parseInt(req.query.limit || '50');

      const events = await eventService.getEventsByType(type, limit);

      res.json({
        success: true,
        events,
        count: events.length
      });
    } catch (error) {
      console.error('Error in getEventsByType:', error);
      res.status(500).json({
        error: 'Failed to fetch events'
      });
    }
  }

  /**
   * GET /api/events/:id/delivery-logs
   * Get delivery logs for an event
   */
  async getDeliveryLogs(req, res) {
    try {
      const { id } = req.params;
      const logs = await eventService.getDeliveryLogs(id);

      res.json({
        success: true,
        logs
      });
    } catch (error) {
      console.error('Error in getDeliveryLogs:', error);
      res.status(500).json({
        error: 'Failed to fetch delivery logs'
      });
    }
  }
}

export default new EventController();

