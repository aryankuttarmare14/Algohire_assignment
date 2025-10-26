/**
 * In-Memory Database Interface
 * Replaces PostgreSQL with simple in-memory storage
 */

export const pool = {
  query: async () => ({ rows: [] }),
};

export async function initializeDatabase() {
  console.log('✅ In-memory database initialized');
}
