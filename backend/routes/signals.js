const express = require('express');
const router  = express.Router();
const Signal  = require('../models/Signal');
const WorkItem = require('../models/WorkItem');
const { getExistingWorkItem, registerWorkItem } = require('../services/debounce');

const SEVERITY_MAP = {
  DB_DELAY:     'P0',
  API_FAILURE:  'P1',
  QUEUE_BACKUP: 'P1',
  CACHE_MISS:   'P2',
};

// Retry wrapper
async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`DB write failed, retrying (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, 200 * (i + 1)));
    }
  }
}

// POST /api/signals
router.post('/', async (req, res) => {
  try {
    const { componentId, type, message } = req.body;

    if (!componentId || !type || !message) {
      return res.status(400).json({ error: 'componentId, type, and message are required' });
    }

    const severity = SEVERITY_MAP[type] || 'P2';

    // Debounce check
    let workItemId = getExistingWorkItem(componentId);

    if (!workItemId) {
      const workItem = await withRetry(() => WorkItem.create({
        componentId,
        title: `${componentId} incident`,
        severity,
        status: 'OPEN',
      }));
      workItemId = workItem._id;
      registerWorkItem(componentId, workItemId);
      console.log(`New WorkItem created for ${componentId}`);
    } else {
      await withRetry(() =>
        WorkItem.findByIdAndUpdate(workItemId, { $inc: { signalCount: 1 } })
      );
      console.log(`Signal linked to existing WorkItem for ${componentId}`);
    }

    const signal = await withRetry(() => Signal.create({
      componentId,
      type,
      severity,
      message,
      workItemId,
    }));

    global.incrementSignal();

    res.status(201).json({ signal, workItemId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signal ingestion failed' });
  }
});

// GET /api/signals/:workItemId
router.get('/:workItemId', async (req, res) => {
  try {
    const signals = await Signal.find({
      workItemId: req.params.workItemId
    }).sort({ createdAt: -1 });
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

module.exports = router;