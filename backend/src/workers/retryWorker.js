import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import webhookDeliveryService from '../services/webhookDeliveryService.js';

/**
 * Retry Worker
 * Processes failed webhook deliveries from the retry queue
 */
const retryQueue = new Queue('webhook-retries', {
  connection: redis,
});

/**
 * Add a job to the retry queue
 */
export async function addRetryJob(event, webhook, attempt) {
  await retryQueue.add('deliver-webhook', {
    event,
    webhook,
    attempt,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    },
  });
}

/**
 * Process retry jobs
 * This would typically be run as a separate worker process
 */
export async function processRetryWorker(job) {
  try {
    const { event, webhook } = job.data;
    
    console.log(`Retrying webhook delivery: ${webhook.target_url}`);
    
    const result = await webhookDeliveryService.deliverToWebhook(event, webhook);
    
    return result;
  } catch (error) {
    console.error('Error processing retry:', error);
    throw error;
  }
}

