// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// We now export BOTH the pool and the query function
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool, // <-- Add this line
};