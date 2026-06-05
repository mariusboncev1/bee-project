const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/jwtAuth');
const togglService = require('../../services/togglService');

// Start time tracking
router.post('/start', authenticateToken, async (req, res) => {
  const { description, projectName } = req.body;
  
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const result = await togglService.startTimeEntry(description, projectName);
  
  if (result.success) {
    return res.json({ message: 'Time tracking started', entry: result.entry });
  } else {
    return res.status(result.mock ? 200 : 500).json({ 
      message: result.message || 'Failed to start time entry',
      mock: result.mock 
    });
  }
});

// Stop time tracking
router.post('/stop/:entryId', authenticateToken, async (req, res) => {
  const { entryId } = req.params;
  const result = await togglService.stopTimeEntry(entryId);
  
  if (result.success) {
    return res.json({ message: 'Time tracking stopped', entry: result.entry });
  } else {
    return res.status(result.mock ? 200 : 500).json({ 
      message: 'Failed to stop time entry',
      mock: result.mock 
    });
  }
});

// Get time entries
router.get('/entries', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const entries = await togglService.getTimeEntries(startDate, endDate);
  res.json({ entries });
});

// Get current running entry
router.get('/current', authenticateToken, async (req, res) => {
  const entry = await togglService.getCurrentTimeEntry();
  res.json({ entry });
});

module.exports = router;
