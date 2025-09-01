const express = require('express');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all medicines
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new medicine
router.post('/', auth, async (req, res) => {
  try {
    const {
      medicineName,
      genericName,
      category,
      strength,
      quantity,
      unit,
      manufacturer,
      expiryDate,
      price,
      supplier,
      location
    } = req.body;

    const medicine = new Medicine({
      medicineName,
      genericName,
      category,
      strength,
      quantity,
      unit,
      manufacturer,
      expiryDate,
      price,
      supplier,
      location
    });

    await medicine.save();
    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medicine
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      medicineName,
      genericName,
      category,
      strength,
      quantity,
      unit,
      manufacturer,
      expiryDate,
      price,
      supplier,
      location
    } = req.body;

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      {
        medicineName,
        genericName,
        category,
        strength,
        quantity,
        unit,
        manufacturer,
        expiryDate,
        price,
        supplier,
        location
      },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete medicine
router.delete('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medicines by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ category: req.params.category }).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock medicines (quantity < 50)
router.get('/low-stock', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ quantity: { $lt: 50 } }).sort({ quantity: 1 });
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expiring medicines (within 30 days)
router.get('/expiring', auth, async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const medicines = await Medicine.find({
      expiryDate: { $lte: thirtyDaysFromNow }
    }).sort({ expiryDate: 1 });
    
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 