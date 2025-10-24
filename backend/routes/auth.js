// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const db = require('../db/db'); // Import our database connection
require('dotenv').config();

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    // 1. Get username and password from the request body
    const { username, password } = req.body;

    // 2. Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // 3. Hash the password
    // A "salt" adds random data to the hash to make it secure
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Insert the new user into the database
    const insertQuery = `
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING id, username; 
    `;
    // 'RETURNING' gives us back the data we just inserted
    
    const { rows } = await db.query(insertQuery, [username, passwordHash]);
    const newUser = rows[0];

    // 5. Create a JWT token for the new user
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token lasts for 1 day
    );

    // 6. Send back the token and user info
    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });

  } catch (err) {
    // This specific error code means "unique_violation" (e.g., username taken)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already exists.' });
    }
    
    // For other errors
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    // 1. Get username and password from the request body
    const { username, password } = req.body;

    // 2. Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // 3. Find the user in the database
    const findUserQuery = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await db.query(findUserQuery, [username]);

    // 4. Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const user = rows[0];

    // 5. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Notice we send the same error for "user not found" and "wrong password".
    // This is a security best practice to prevent "user enumeration" attacks.

    // 6. Create and send a new JWT token (same as in register)
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 7. Send back the token and user info
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});



module.exports = router;