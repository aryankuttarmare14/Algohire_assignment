import express from 'express';
import dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * Dashboard Routes
 * All routes prefixed with /api/dashboard
 */
router.get('/stats', dashboardController.getStats.bind(dashboardController));
router.get('/health', dashboardController.getHealth.bind(dashboardController));
router.get('/logs', dashboardController.getRecentLogs.bind(dashboardController));
router.post('/retry/:logId', dashboardController.retryDelivery.bind(dashboardController));

export default router;

