const mongoose = require('mongoose');

const RCASchema = new mongoose.Schema({
  workItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkItem',
    required: true,
  },
  rootCauseCategory: {
    type: String,
    enum: [
      'INFRASTRUCTURE',
      'CODE_BUG',
      'CONFIGURATION',
      'EXTERNAL_DEPENDENCY',
      'HUMAN_ERROR'
    ],
    required: true,
  },
  fixApplied: {
    type: String,
    required: true,
    minlength: 10,
    // Force engineers to actually write something
  },
  preventionSteps: {
    type: String,
    required: true,
    minlength: 10,
  },
  incidentStart: {
    type: Date,
    required: true,
  },
  incidentEnd: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('RCA', RCASchema);