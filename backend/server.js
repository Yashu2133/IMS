const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://incmasys.netlify.app' // your netlify URL
  ]
}));
app.use(express.json());

// Rate limiter — max 100 requests per minute on signal ingestion
const signalLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute window
  max: 100,                  // max 100 signals per minute
  message: {
    error: 'Too many signals received. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter ONLY to signal ingestion
app.use('/api/signals', signalLimiter);

// Routes
app.use('/api/signals',   require('./routes/signals'));
app.use('/api/workitems', require('./routes/workitems'));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    signalsProcessed: global.signalCount || 0,
  });
});

// Throughput metrics — print every 5 seconds
let signalsInWindow = 0;
global.signalCount  = 0;

// Export so routes can increment it
global.incrementSignal = () => {
  signalsInWindow++;
  global.signalCount++;
};

setInterval(() => {
  console.log(`[METRICS] Signals/sec: ${(signalsInWindow / 5).toFixed(2)} | Total: ${global.signalCount}`);
  signalsInWindow = 0;
}, 5000);

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
      console.log(`Health check: http://localhost:${process.env.PORT}/health`);
    });
  })
  .catch(err => console.error('DB connection failed:', err));