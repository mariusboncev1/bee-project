const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { User, UserProfile, Log } = require('../models');

// GET /register - SSR register page
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { error: null, title: 'Register - ApiNote' });
});

// POST /register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.render('register', { error: 'Email already in use.', title: 'Register - ApiNote' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    await UserProfile.create({ userId: user.id });
    await Log.create({ userId: user.id, action: 'REGISTER', entity: 'User', entityId: user.id, details: 'New user registered' });
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Registration failed. ' + err.message, title: 'Register - ApiNote' });
  }
});

// GET /login - SSR login page
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null, title: 'Login - ApiNote' });
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('login', { error: 'Invalid email or password.', title: 'Login - ApiNote' });
    }
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    await Log.create({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id, details: 'User logged in' });
    res.redirect('/dashboard');
  } catch (err) {
    res.render('login', { error: 'Login failed. ' + err.message, title: 'Login - ApiNote' });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
