const { Pool } = require('pg');
require('dotenv').config();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql://')) {
  console.error('Invalid or missing DATABASE_URL');
}

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  max: 20,
  idleTimeoutMillis: 30000,
};

async function connectWithRetry(attempts = 3, delayMs = 2000) {
  for (let i = 0; i < attempts; i++) {
    try {
      const pool = new Pool(poolConfig);
      const client = await pool.connect();
      console.log('Database connection successful');
      client.release();
      return pool;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err.message, err.stack);
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  console.error('All connection attempts failed. Using fallback mode.');
  return null;
}

let pool;
connectWithRetry().then(result => {
  pool = result || { query: async () => ({ rows: [] }) }; // Fallback
}).catch(err => console.error('Failed to connect to database:', err.message, err.stack));

module.exports = {
  async query(text, params) {
    if (!pool) {
      console.warn('No database connection. Returning empty result.');
      return { rows: [] };
    }
    try {
      const result = await pool.query(text, params);
      console.log('Query executed:', { text });
      return result;
    } catch (error) {
      console.error('Error in query:', { text, error: error.message, stack: error.stack });
      throw error;
    }
  },
  get pool() {
    return pool;
  }
};