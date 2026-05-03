const mongoose = require('mongoose');

const WorkItemSchema = new mongoose.Schema({
  componentId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['P0', 'P1', 'P2'],
    required: true,
  },
  status: {
    type: String,
    enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
  },
  signalCount: {
    type: Number,
    default: 1,
    // How many signals triggered this incident
  },
  startTime: {
    type: Date,
    default: Date.now,
    // When the first signal arrived
  },
  endTime: {
    type: Date,
    default: null,
    // Set when RCA is submitted
  },
  mttr: {
    type: Number,
    default: null,
    // Mean Time To Repair in minutes
  },
  rcaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RCA',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('WorkItem', WorkItemSchema);