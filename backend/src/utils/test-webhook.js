import { pool } from '../config/database.js';
import webhookDeliveryService from '../services/webhookDeliveryService.js';

/**
 * Test script to send a sample event and verify webhook delivery
 * Usage: node src/utils/test-webhook.js
 */
async function testWebhookDelivery() {
  try {
    console.log('🧪 Testing webhook delivery...\n');

    // Get all active webhooks
    const webhooks = await pool.query(
      `SELECT * FROM webhooks WHERE is_active = true LIMIT 1`
    );

    if (webhooks.rows.length === 0) {
      console.log('⚠️  No active webhooks found. Please create a webhook first.');
      console.log('   Run: INSERT INTO webhooks (event_type, target_url, secret) VALUES (...)');
      process.exit(0);
    }

    const webhook = webhooks.rows[0];
    console.log(`📡 Found webhook: ${webhook.event_type} -> ${webhook.target_url}\n`);

    // Create a test event
    const testEvent = {
      id: 999,
      event_id: `test_${Date.now()}`,
      type: webhook.event_type,
      payload: {
        test: true,
        message: 'This is a test event',
        timestamp: new Date().toISOString(),
      },
    };

    console.log('📨 Sending test event...');
    console.log(JSON.stringify(testEvent.payload, null, 2));
    console.log('');

    // Deliver the event
    const result = await webhookDeliveryService.deliverToWebhook(testEvent, webhook);

    if (result.success) {
      console.log('✅ Webhook delivered successfully!');
      console.log(`   Status: ${result.status}`);
    } else {
      console.log('❌ Webhook delivery failed');
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${result.error}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testWebhookDelivery();

