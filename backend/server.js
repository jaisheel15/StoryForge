// server.js
require('dotenv').config(); // Make sure this is at the top

const express = require('express');
const cors = require('cors');
// --- UPDATE THIS LINE ---
const { createUsersTable, createStoriesTable, createChaptersTable,createVotesTable } = require('./db/initDB');
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const chapterRoutes = require('./routes/chapter');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json()); 

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Welcome to the Collaborative Story API!');
});

app.use('/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/chapters', chapterRoutes);

// --- Server Startup ---
async function startServer() {
  // --- UPDATE THIS SECTION ---
  await createUsersTable();
  await createStoriesTable();
  await createChaptersTable();
  await createVotesTable();
  // --- END UPDATE ---

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();