const { Pool } = require('pg');
require('dotenv').config();

/* ***************
 * Connection Pool
 * SSL required for Render.com
 *********************************/
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql://')) {
  throw new Error('Invalid or missing DATABASE_URL');
}

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true,
  },
  connectionTimeoutMillis: 5000,
  max: 10,
};

async function connectWithRetry(attempts = 3, delayMs = 2000) {
  for (let i = 0; i < attempts; i++) {
    try {
      const pool = new Pool(poolConfig);
      await pool.connect();
      console.log('Database connection successful');
      return pool;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err);
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw err;
      }
    }
  }
}

connectWithRetry().catch(err => console.error('Failed to connect to database:', err));

const pool = new Pool(poolConfig);

// Query method
module.exports = {
  async query(text, params) {
    try {
      const result = await pool.query(text, params);
      console.log('Query executed:', { text });
      return result;
    } catch (error) {
      console.error('Error in query:', { text, error });
      throw error;
    }
  },
  pool,
};