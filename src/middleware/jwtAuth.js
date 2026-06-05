const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'apinote_jwt_secret_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'apinote_refresh_secret_2024';

/**
 * Generate a short-lived access token (15 minutes).
 * @param {Object} user - User instance with id, email, role
 * @returns {string} Signed JWT access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Generate a long-lived refresh token (7 days).
 * @param {Object} user - User instance with id, email, role
 * @returns {string} Signed JWT refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Express middleware that validates a JWT Bearer token from the
 * Authorization header and attaches the decoded payload to req.user.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired' });
    }
    return res.status(403).json({ error: 'Invalid access token' });
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
};
