const mongoose = require('mongoose');

const SignalSchema = new mongoose.Schema({
  componentId: {
    type: String,
    required: true,
    // e.g. "CACHE_CLUSTER_01", "PAYMENT_API", "DB_PRIMARY"
  },
  type: {
    type: String,
    enum: ['API_FAILURE', 'DB_DELAY', 'CACHE_MISS', 'QUEUE_BACKUP'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['P0', 'P1', 'P2'],
    required: true,
    // P0 = critical (DB down), P2 = minor (cache miss)
  },
  message: {
    type: String,
    required: true,
  },
  workItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkItem',
    default: null,
    // Links this signal to its parent incident
  },
}, { timestamps: true }); // adds createdAt, updatedAt automatically

module.exports = mongoose.model('Signal', SignalSchema);