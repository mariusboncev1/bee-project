const express = require('express');
const router = express.Router();
const { Apiary, Hive, Log, sequelize } = require('../models');

router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const apiaries = await Apiary.findAll({ where: { userId }, include: [{ association: 'hives', attributes: ['id', 'number', 'status'] }] });
    res.json(apiaries);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const apiary = await Apiary.findByPk(req.params.id, { include: ['hives'] });
    if (!apiary) return res.status(404).json({ error: 'Not found' });
    res.json(apiary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/hives', async (req, res) => {
  try {
    const hives = await Hive.findAll({ where: { apiaryId: req.params.id } });
    res.json(hives);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.session.userId || req.body.userId;
    const apiary = await Apiary.create({ ...req.body, userId }, { transaction: t });
    
    const hive = await Hive.create({ apiaryId: apiary.id, number: 1, notes: 'Default first hive' }, { transaction: t });
    
    await Log.create({
      userId,
      action: 'CREATE_APIARY',
      entity: 'Apiary',
      entityId: apiary.id,
      details: `Apiary "${apiary.name}" created with hive #${hive.id}`,
    }, { transaction: t });
    await t.commit();

    
    const io = req.app.get('io');
    if (io) io.emit('apiary:created', { id: apiary.id, name: apiary.name, userId });

    res.status(201).json({ apiary, hive });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const apiary = await Apiary.findByPk(req.params.id);
    if (!apiary) return res.status(404).json({ error: 'Not found' });
    await apiary.update(req.body);
    res.json(apiary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.delete('/:id', async (req, res) => {
  try {
    const apiary = await Apiary.findByPk(req.params.id);
    if (!apiary) return res.status(404).json({ error: 'Not found' });
    await apiary.destroy();
    const io = req.app.get('io');
    if (io) io.emit('apiary:deleted', { id: req.params.id });
    res.json({ message: 'Apiary deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
