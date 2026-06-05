const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { User, RefreshToken, Log } = require('../../models');
const {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  JWT_REFRESH_SECRET,
} = require('../../middleware/jwtAuth');

// ── POST /api/auth/register ─────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist refresh token
    const decoded = jwt.decode(refreshToken);
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
    });

    // Activity log
    await Log.create({
      userId: user.id,
      action: 'API_REGISTER',
      entity: 'User',
      entityId: user.id,
      details: 'User registered via API',
    });

    return res.status(201).json({
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('API register error:', err);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// ── POST /api/auth/login ────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const decoded = jwt.decode(refreshToken);
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
    });

    await Log.create({
      userId: user.id,
      action: 'API_LOGIN',
      entity: 'User',
      entityId: user.id,
      details: 'User logged in via API',
    });

    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('API login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// ── POST /api/auth/refresh ──────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    // Verify the JWT signature & expiry
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Look up the stored token and check revocation
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken, userId: decoded.id },
    });

    if (!storedToken || storedToken.isRevoked) {
      return res.status(403).json({ error: 'Refresh token is invalid or revoked' });
    }

    // Fetch the latest user data for the new access token
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Refresh token expired' });
    }
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// ── POST /api/auth/logout ───────────────────────────────────
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    if (storedToken) {
      storedToken.isRevoked = true;
      await storedToken.save();
    }

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('API logout error:', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('API me error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
