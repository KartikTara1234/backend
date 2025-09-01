const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  patientName: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bed', bedSchema); 