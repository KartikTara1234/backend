const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Pain Relief', 'Antibiotic', 'Antiviral', 'Antifungal', 'Cardiovascular', 'Diabetes', 'Respiratory', 'Gastrointestinal', 'Vitamins', 'Other'],
    required: true
  },
  strength: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['Tablets', 'Capsules', 'Bottles', 'Vials', 'Tubes', 'Packs', 'Units'],
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema); 