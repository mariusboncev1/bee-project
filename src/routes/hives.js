const express = require('express');
const router = express.Router();
const { Hive, Inspection } = require('../models');

// GET /api/hives
router.get('/', async (req, res) => {
  try {
    const hives = await Hive.findAll();
    res.json(hives);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/hives/:id
router.get('/:id', async (req, res) => {
  try {
    const hive = await Hive.findByPk(req.params.id, { include: ['inspections'] });
    if (!hive) return res.status(404).json({ error: 'Not found' });
    res.json(hive);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/hives
router.post('/', async (req, res) => {
  try {
    const existing = await Hive.findOne({ where: { apiaryId: req.body.apiaryId, number: req.body.number } });
    if (existing) {
      return res.status(400).json({ error: `Hive number ${req.body.number} already exists in this apiary.` });
    }
    const hive = await Hive.create(req.body);
    const io = req.app.get('io');
    if (io) io.emit('hive:created', { id: hive.id, number: hive.number, apiaryId: hive.apiaryId });
    res.status(201).json(hive);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/hives/:id
router.put('/:id', async (req, res) => {
  try {
    const hive = await Hive.findByPk(req.params.id);
    if (!hive) return res.status(404).json({ error: 'Not found' });
    await hive.update(req.body);
    res.json(hive);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/hives/:id
router.delete('/:id', async (req, res) => {
  try {
    const hive = await Hive.findByPk(req.params.id);
    if (!hive) return res.status(404).json({ error: 'Not found' });
    await hive.destroy();
    res.json({ message: 'Hive deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
