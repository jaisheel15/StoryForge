// middleware/checkAuth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // 1. Get token from the 'Authorization' header
    // The header typically looks like: "Bearer YOUR_TOKEN_STRING"
    const token = req.headers.authorization.split(' ')[1];

    // 2. Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user data to the request object for other routes to use
    req.userData = { 
      userId: decodedToken.userId, 
      username: decodedToken.username 
    };
    
    // 4. Call 'next()' to allow the request to continue
    next();
  } catch (error) {
    // If token is missing, invalid, or expired
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};