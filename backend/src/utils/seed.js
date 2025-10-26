import { pool } from '../config/database.js';
import crypto from 'crypto';

/**
 * Seed database with sample webhooks and events
 * Run this once to populate the database with demo data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Create sample webhooks
    const webhookTypes = [
      { event_type: 'job_created', target_url: 'https://httpbin.org/post' },
      { event_type: 'candidate_updated', target_url: 'https://httpbin.org/post' },
      { event_type: 'application_submitted', target_url: 'https://webhook.site/test' },
    ];

    for (const { event_type, target_url } of webhookTypes) {
      const secret = crypto.randomBytes(32).toString('hex');
      
      await pool.query(
        `INSERT INTO webhooks (event_type, target_url, secret)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [event_type, target_url, secret]
      );
      
      console.log(`✅ Created webhook for ${event_type}`);
    }

    // Create sample events
    const sampleEvents = [
      {
        event_id: `event_${Date.now()}_1`,
        type: 'job_created',
        payload: {
          job_id: 'job_123',
          title: 'Senior Backend Developer',
          company: 'Algohire',
          location: 'San Francisco, CA',
          salary: '$150k - $180k',
        },
      },
      {
        event_id: `event_${Date.now()}_2`,
        type: 'candidate_updated',
        payload: {
          candidate_id: 'cand_456',
          name: 'John Doe',
          status: 'interview_scheduled',
          updated_fields: ['status', 'interview_date'],
        },
      },
      {
        event_id: `event_${Date.now()}_3`,
        type: 'application_submitted',
        payload: {
          application_id: 'app_789',
          job_id: 'job_123',
          candidate_id: 'cand_456',
          applied_at: new Date().toISOString(),
        },
      },
    ];

    for (const event of sampleEvents) {
      await pool.query(
        `INSERT INTO events (event_id, type, payload)
         VALUES ($1, $2, $3)
         ON CONFLICT (event_id) DO NOTHING`,
        [event.event_id, event.type, JSON.stringify(event.payload)]
      );
      
      console.log(`✅ Created sample event: ${event.type}`);
    }

    console.log('✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };

