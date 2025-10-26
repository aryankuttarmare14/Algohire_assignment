import express from 'express';
import webhookController from '../controllers/webhookController.js';

const router = express.Router();

/**
 * Webhook Routes
 * All routes prefixed with /api/webhooks
 */
router.post('/', webhookController.createWebhook.bind(webhookController));
router.get('/', webhookController.getAllWebhooks.bind(webhookController));
router.get('/:id', webhookController.getWebhookById.bind(webhookController));
router.put('/:id', webhookController.updateWebhook.bind(webhookController));
router.delete('/:id', webhookController.deleteWebhook.bind(webhookController));
router.patch('/:id/toggle', webhookController.toggleWebhookStatus.bind(webhookController));

export default router;

