// routes/stories.js
const express = require('express');
const db = require('../db/db');
const checkAuth = require('../middleware/checkAuth'); // <-- Import our new middleware

const router = express.Router();

// POST /api/stories
// We add 'checkAuth' as a middleware. It will run before the main (req, res) logic.
router.post('/', checkAuth, async (req, res) => {
  // We have access to 'req.userData' because 'checkAuth' passed it to us
  const { userId } = req.userData;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  // We use a database "transaction" here.
  // This ensures that BOTH the story and its first chapter are created,
  // or NEITHER is, if an error occurs. This prevents "orphaned" data.
  const client = await db.pool.connect(); // Get a client from the pool

  try {
    await client.query('BEGIN'); // Start the transaction

    // 1. Insert the story
    const storyQuery = `
      INSERT INTO stories (title, author_id)
      VALUES ($1, $2)
      RETURNING id, title, created_at;
    `;
    const storyResult = await client.query(storyQuery, [title, userId]);
    const newStory = storyResult.rows[0];

    // 2. Insert the first chapter (which is always canon)
    const chapterQuery = `
      INSERT INTO chapters (story_id, author_id, content, parent_chapter_id, is_canon)
      VALUES ($1, $2, $3, NULL, true)
      RETURNING id, content;
    `;
    const chapterResult = await client.query(chapterQuery, [newStory.id, userId, content]);
    const firstChapter = chapterResult.rows[0];

    await client.query('COMMIT'); // Commit the transaction

    // 3. Send back the combined result
    res.status(201).json({
      message: 'Story created successfully!',
      story: newStory,
      firstChapter: firstChapter,
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Roll back if any part failed
    console.error('Story Creation Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release(); // Release the client back to the pool
  }
});

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id, 
        s.title, 
        s.created_at, 
        u.username AS author_username
      FROM stories s
      JOIN users u ON s.author_id = u.id
      ORDER BY s.created_at DESC;
    `;
    
    const { rows } = await db.query(query);
    res.status(200).json(rows);

  } catch (err) {
    console.error('Get All Stories Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/:storyId/canon', async (req, res) => {
  const { storyId } = req.params;

  try {
    // This query gets the story details AND all its canon chapters in order.
    const query = `
SELECT 
    s.id AS story_id, 
    s.title,
    s.author_id,
    s_author.username AS story_author_username,
    c.id AS chapter_id,
    c.content,
    c.created_at,
    c_author.username AS chapter_author_username,

    -- This subquery counts non-canon children for each canon chapter
    (
      SELECT COUNT(*) 
      FROM chapters AS alt 
      WHERE alt.parent_chapter_id = c.id AND alt.is_canon = false
    ) AS alternative_count

  FROM stories s
  JOIN users s_author ON s.author_id = s_author.id
  JOIN chapters c ON s.id = c.story_id
  JOIN users c_author ON c.author_id = c_author.id
  WHERE s.id = $1 AND c.is_canon = true
  ORDER BY c.created_at ASC;
    `;
    
    const { rows } = await db.query(query, [storyId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Story not found or has no content.' });
    }
    
    // Group the chapters under the story details for a cleaner response
const storyDetails = {
  story_id: rows[0].story_id,
  title: rows[0].title,
  author_id: rows[0].author_id,
  author_username: rows[0].story_author_username,
  chapters: rows.map(row => ({
    chapter_id: row.chapter_id,
    content: row.content,
    author: row.chapter_author_username,
    created_at: row.created_at,
    alternative_count: parseInt(row.alternative_count, 10) // <-- ADD THIS
  })),
};

    res.status(200).json(storyDetails);

  } catch (err) {
    console.error('Get Canon Story Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/:storyId/advance', checkAuth, async (req, res) => {
  const { storyId } = req.params;
  // We can also check if req.userData.userId is the story's author,
  // but for now, we'll just keep it simple.

  const client = await db.pool.connect(); // Use a transaction

  try {
    await client.query('BEGIN');

    // 1. Find the ID of the *last* canon chapter in this story.
    const lastCanonChapterQuery = `
      SELECT id FROM chapters
      WHERE story_id = $1 AND is_canon = true
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const lastCanonResult = await client.query(lastCanonChapterQuery, [storyId]);

    if (lastCanonResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Story has no canon chapters to advance from.' });
    }

    const lastCanonChapterId = lastCanonResult.rows[0].id;

    // 2. Find the winning child of that last canon chapter.
    // This query joins chapters with votes, groups by the chapter ID,
    // counts the votes, and orders by the highest count, picking the top 1.
    const findWinnerQuery = `
      SELECT 
        c.id, 
        COUNT(v.id) AS vote_count
      FROM chapters c
      LEFT JOIN votes v ON c.id = v.chapter_id
      WHERE c.parent_chapter_id = $1 AND c.is_canon = false
      GROUP BY c.id
      ORDER BY vote_count DESC
      LIMIT 1;
    `;
    const winnerResult = await client.query(findWinnerQuery, [lastCanonChapterId]);

    if (winnerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No submissions found to vote on.' });
    }

    const winningChapterId = winnerResult.rows[0].id;

    // 3. Promote the winner to canon!
    const promoteQuery = `
      UPDATE chapters
      SET is_canon = true
      WHERE id = $1
      RETURNING *;
    `;
    const promoteResult = await client.query(promoteQuery, [winningChapterId]);

    await client.query('COMMIT'); // Commit all our changes

    res.status(200).json({
      message: 'Story advanced successfully!',
      newCanonChapter: promoteResult.rows[0],
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Undo all changes if anything fails
    console.error('Story Advance Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release(); // Release the client back to the pool
  }
});

module.exports = router;