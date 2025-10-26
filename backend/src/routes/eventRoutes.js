import express from 'express';
import eventController from '../controllers/eventController.js';

const router = express.Router();

/**
 * Event Routes
 * All routes prefixed with /api/events
 */
router.post('/', eventController.createEvent.bind(eventController));
router.get('/', eventController.getAllEvents.bind(eventController));
router.get('/:id', eventController.getEventById.bind(eventController));
router.get('/type/:type', eventController.getEventsByType.bind(eventController));
router.get('/:id/delivery-logs', eventController.getDeliveryLogs.bind(eventController));

export default router;

