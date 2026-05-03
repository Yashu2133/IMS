const axios = require('axios');

// npm install axios first
const BASE_URL = 'http://localhost:5000/api/signals';

const FAKE_SIGNALS = [
  { componentId: 'PAYMENT_API',     type: 'API_FAILURE',  message: 'Connection timeout after 30s' },
  { componentId: 'DB_PRIMARY',      type: 'DB_DELAY',     message: 'Query took 8000ms, threshold is 2000ms' },
  { componentId: 'CACHE_CLUSTER_01',type: 'CACHE_MISS',   message: 'Redis not responding on port 6379' },
  { componentId: 'JOB_QUEUE',       type: 'QUEUE_BACKUP', message: '5000 jobs pending, workers not consuming' },
  { componentId: 'PAYMENT_API',     type: 'API_FAILURE',  message: 'Still timing out — retry #2' },
  { componentId: 'PAYMENT_API',     type: 'API_FAILURE',  message: 'Still timing out — retry #3' },
  { componentId: 'DB_PRIMARY',      type: 'DB_DELAY',     message: 'Query took 9500ms' },
];

async function simulate() {
  console.log('Starting signal simulation...\n');

  for (const signal of FAKE_SIGNALS) {
    try {
      const res = await axios.post(BASE_URL, signal);
      console.log(`✓ Sent: ${signal.componentId} → WorkItem: ${res.data.workItemId}`);
    } catch (err) {
      console.error(`✗ Failed: ${signal.componentId}`, err.message);
    }
    // Wait 500ms between signals
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\nSimulation complete!');
}

simulate();