const express = require('express');
const router = express.Router();
const { User, UserProfile } = require('../models');

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'] });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: [{ association: 'profile' }], attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    await user.update(req.body);
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/:id/profile
router.get('/:id/profile', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ where: { userId: req.params.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/:id/profile
router.put('/:id/profile', async (req, res) => {
  try {
    const [profile, created] = await UserProfile.findOrCreate({ where: { userId: req.params.id }, defaults: { userId: req.params.id } });
    await profile.update(req.body);
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
