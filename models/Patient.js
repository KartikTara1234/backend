const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  time: {
    type: String,
    required: true
  },
  fees: {
    type: String,
    enum: ['PAID', 'UNPAID'],
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  doctor: {
    type: String,
    required: true
  },
  treatment: {
    type: String,
    required: true,
    maxlength: 50
  },
  receivedBy: {
    type: String,
    default: ''
  },
  medications: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    prescribedDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema); 