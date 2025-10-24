// routes/chapters.js
const express = require('express');
const db = require('../db/db');
const checkAuth = require('../middleware/checkAuth');

const router = express.Router();

// POST /api/chapters
// Submits a new (non-canon) chapter for consideration
router.post('/', checkAuth, async (req, res) => {
  const { userId } = req.userData;
  const { story_id, content, parent_chapter_id } = req.body;

  // 1. Validation
  if (!story_id || !content || !parent_chapter_id) {
    return res.status(400).json({ 
      error: 'story_id, content, and parent_chapter_id are required.' 
    });
  }

  try {
    // 2. Insert the new chapter. 
    // 'is_canon' is 'false' by default from our database schema.
    const query = `
      INSERT INTO chapters (story_id, author_id, content, parent_chapter_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const { rows } = await db.query(query, [story_id, userId, content, parent_chapter_id]);
    const newChapter = rows[0];

    // 3. Send back the new chapter
    res.status(201).json({
      message: 'Chapter submitted successfully!',
      chapter: newChapter,
    });

  } catch (err) {
    // Check for foreign key violation (e.g., story_id or parent_chapter_id doesn't exist)
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Invalid story_id or parent_chapter_id.' });
    }
    console.error('Chapter Submission Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/pending/:parentChapterId', async (req, res) => {
  const { parentChapterId } = req.params;

  try {
    const query = `
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        u.username AS author_username
      FROM chapters c
      JOIN users u ON c.author_id = u.id
      WHERE c.parent_chapter_id = $1 AND c.is_canon = false
      ORDER BY c.created_at ASC;
    `;
    
    const { rows } = await db.query(query, [parentChapterId]);

    // It's okay if this returns an empty array; it just means no submissions yet.
    res.status(200).json(rows);

  } catch (err) {
    console.error('Get Pending Chapters Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/:chapterId/vote', checkAuth, async (req, res) => {
  const { userId } = req.userData;
  const { chapterId } = req.params;

  try {
    const query = `
      INSERT INTO votes (user_id, chapter_id)
      VALUES ($1, $2);
    `;
    await db.query(query, [userId, chapterId]);

    res.status(201).json({ message: 'Vote cast successfully!' });

  } catch (err) {
    // This error code means the 'UNIQUE' constraint was violated.
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You have already voted for this chapter.' });
    }
    // This error means the chapter_id doesn't exist.
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Chapter not found.' });
    }
    console.error('Vote Casting Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


module.exports = router;