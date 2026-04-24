const express = require('express');
const router = express.Router();
const { Log } = require('../models');

// GET /api/logs
router.get('/', async (req, res) => {
  try {
    const logs = await Log.findAll({ order: [['createdAt', 'DESC']], limit: 100 });
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/logs
router.post('/', async (req, res) => {
  try {
    const log = await Log.create({ ...req.body, userId: req.session.userId });
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/logs/:id
router.put('/:id', async (req, res) => {
  try {
    const log = await Log.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Not found' });
    await log.update(req.body);
    res.json(log);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/logs/:id
router.delete('/:id', async (req, res) => {
  try {
    const log = await Log.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Not found' });
    await log.destroy();
    res.json({ message: 'Log deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
