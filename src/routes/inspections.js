const express = require('express');
const router = express.Router();
const { Inspection } = require('../models');

// GET /api/inspections
router.get('/', async (req, res) => {
  try {
    const inspections = await Inspection.findAll({ order: [['inspectedAt', 'DESC']] });
    res.json(inspections);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/inspections/:id
router.get('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id, { include: ['hive'] });
    if (!inspection) return res.status(404).json({ error: 'Not found' });
    res.json(inspection);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/inspections
router.post('/', async (req, res) => {
  try {
    const inspection = await Inspection.create(req.body);
    const io = req.app.get('io');
    if (io) io.emit('inspection:created', { id: inspection.id, hiveId: inspection.hiveId });
    res.status(201).json(inspection);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/inspections/:id
router.put('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) return res.status(404).json({ error: 'Not found' });
    await inspection.update(req.body);
    res.json(inspection);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/inspections/:id
router.delete('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) return res.status(404).json({ error: 'Not found' });
    await inspection.destroy();
    res.json({ message: 'Inspection deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
