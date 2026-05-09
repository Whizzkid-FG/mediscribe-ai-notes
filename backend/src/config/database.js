import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const poolConfig = connectionString
  ? { connectionString }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'medscribe',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    };

// Managed Postgres providers (Neon/Render/Supabase) generally require SSL.
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute a query with connection pooling
 * @param {string} text - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Query result
 */
export const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Get a client for transactions
 * @returns {Promise} Database client
 */
export const getClient = () => {
  return pool.connect();
};

export default pool;
