// initDb.js
const db = require('./db');

async function createUsersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  try {
    await db.query(createTableQuery);
    console.log('"users" table successfully created or already exists.');
  } catch (err) {
    console.error('Error creating "users" table:', err);
    process.exit(1);
  }
}

// --- ADD THIS NEW FUNCTION ---
async function createStoriesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS stories (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      settings JSONB DEFAULT '{}'
    );
  `;
  
  try {
    await db.query(createTableQuery);
    console.log('"stories" table successfully created or already exists.');
  } catch (err) {
    console.error('Error creating "stories" table:', err);
    process.exit(1);
  }
}

// --- ADD THIS NEW FUNCTION ---
async function createChaptersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS chapters (
      id SERIAL PRIMARY KEY,
      story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      author_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      parent_chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
      is_canon BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  try {
    await db.query(createTableQuery);
    console.log('"chapters" table successfully created or already exists.');
  } catch (err) {
    console.error('Error creating "chapters" table:', err);
    process.exit(1);
  }
}

async function createVotesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, chapter_id)
    );
  `;
  // The 'UNIQUE' constraint is critical. It prevents a user from voting
  // for the same chapter more than once at the database level.

  try {
    await db.query(createTableQuery);
    console.log('"votes" table successfully created or already exists.');
  } catch (err) {
    console.error('Error creating "votes" table:', err);
    process.exit(1);
  }
}

// --- UPDATE THE EXPORTS ---
module.exports = { 
  createUsersTable,
  createStoriesTable,
  createChaptersTable,
  createVotesTable
};