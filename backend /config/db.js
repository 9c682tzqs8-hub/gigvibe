// /config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Initialize the PostgreSQL connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Recommended production settings for pooling
  max: 20, // Max number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection during application startup
pool.on('connect', () => {
  console.log('Successfully connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export a query helper function to standardise database calls across models
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Exporting pool directly in case transactions are needed later
};