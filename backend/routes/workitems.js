const express = require('express');
const router = express.Router();
const WorkItem = require('../models/WorkItem');
const RCA = require('../models/RCA');

// Valid status transitions
const VALID_TRANSITIONS = {
  OPEN:          'INVESTIGATING',
  INVESTIGATING: 'RESOLVED',
  RESOLVED:      'CLOSED',
};

// GET /api/workitems — get all incidents (for dashboard)
router.get('/', async (req, res) => {
  try {
    const workItems = await WorkItem.find()
      .sort({ createdAt: -1 });
    res.json(workItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET /api/workitems/:id — get one incident
router.get('/:id', async (req, res) => {
  try {
    const workItem = await WorkItem.findById(req.params.id).populate('rcaId');
    if (!workItem) return res.status(404).json({ error: 'Not found' });
    res.json(workItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// PATCH /api/workitems/:id/status — move to next status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const workItem = await WorkItem.findById(req.params.id);
    if (!workItem) return res.status(404).json({ error: 'Not found' });

    // Enforce valid transitions
    const expectedNext = VALID_TRANSITIONS[workItem.status];
    if (status !== expectedNext) {
      return res.status(400).json({
        error: `Invalid transition. Current: ${workItem.status}, allowed next: ${expectedNext}`
      });
    }

    // Block CLOSED if RCA is missing
    if (status === 'CLOSED' && !workItem.rcaId) {
      return res.status(400).json({
        error: 'Cannot close incident without a completed RCA'
      });
    }

    workItem.status = status;
    await workItem.save();

    res.json(workItem);
  } catch (err) {
    res.status(500).json({ error: 'Status update failed' });
  }
});

// POST /api/workitems/:id/rca — submit RCA and auto-close
router.post('/:id/rca', async (req, res) => {
  try {
    const { rootCauseCategory, fixApplied, preventionSteps, incidentStart, incidentEnd } = req.body;
    const workItem = await WorkItem.findById(req.params.id);
    if (!workItem) return res.status(404).json({ error: 'Not found' });

    if (workItem.status === 'CLOSED') {
      return res.status(400).json({ error: 'Incident already closed' });
    }

    // Create RCA
    const rca = await RCA.create({
      workItemId: workItem._id,
      rootCauseCategory,
      fixApplied,
      preventionSteps,
      incidentStart,
      incidentEnd,
    });

    // Calculate MTTR in minutes
    const start = new Date(incidentStart);
    const end = new Date(incidentEnd);
    const mttrMinutes = Math.round((end - start) / 60000);

    // Update WorkItem
    workItem.rcaId  = rca._id;
    workItem.status  = 'CLOSED';
    workItem.endTime = end;
    workItem.mttr    = mttrMinutes;
    await workItem.save();

    res.status(201).json({ rca, workItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'RCA submission failed' });
  }
});

module.exports = router;