const express = require('express');
const Bed = require('../models/Bed');
const auth = require('../middleware/auth');

const router = express.Router();

// Function to convert 12-hour format time to 24-hour format
function convertTo24Hour(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return timeStr;

  const timeRegex = /^(\d{1,2}):(\d{2})$/;
  const match = timeStr.match(timeRegex);

  if (!match) return timeStr; // If not in expected format, return as is

  let hour = parseInt(match[1], 10);
  const minute = match[2];

  // If hour is 1-11, assume PM and add 12
  // If hour is 12, keep as 12 (noon)
  if (hour >= 1 && hour <= 11) {
    hour += 12;
  }

  // Ensure hour is two digits
  const hourStr = hour.toString().padStart(2, '0');

  return `${hourStr}:${minute}`;
}

// Initialize beds (create 10 beds if they don't exist)
router.post('/initialize', auth, async (req, res) => {
  try {
    const bedCount = await Bed.countDocuments();
    
    if (bedCount === 0) {
      const beds = [];
      for (let i = 1; i <= 10; i++) {
        beds.push({
          id: i,
          isBooked: false,
          patientName: '',
          time: ''
        });
      }
      
      await Bed.insertMany(beds);
      res.json({ message: 'Beds initialized successfully' });
    } else {
      res.json({ message: 'Beds already exist' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all beds
router.get('/', auth, async (req, res) => {
  try {
    const beds = await Bed.find().sort({ id: 1 });
    res.json(beds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available beds only
router.get('/available', auth, async (req, res) => {
  try {
    const beds = await Bed.find({ isBooked: false }).sort({ id: 1 });
    res.json(beds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booked beds only
router.get('/booked', auth, async (req, res) => {
  try {
    const beds = await Bed.find({ isBooked: true }).sort({ id: 1 });
    res.json(beds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book a bed
router.post('/:id/book', auth, async (req, res) => {
  try {
    const { patientName, time } = req.body;

    const bed = await Bed.findOneAndUpdate(
      { id: req.params.id, isBooked: false },
      {
        isBooked: true,
        patientName,
        time
      },
      { new: true }
    );

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found or already booked' });
    }

    res.json(bed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unbook a bed
router.post('/:id/unbook', auth, async (req, res) => {
  try {
    const bed = await Bed.findOneAndUpdate(
      { id: req.params.id, isBooked: true },
      {
        isBooked: false,
        patientName: '',
        time: ''
      },
      { new: true }
    );

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found or not booked' });
    }

    res.json(bed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bed details
router.put('/:id', auth, async (req, res) => {
  try {
    const { isBooked, patientName, time } = req.body;

    const bed = await Bed.findOneAndUpdate(
      { id: req.params.id },
      {
        isBooked,
        patientName: isBooked ? patientName : '',
        time: isBooked ? time : ''
      },
      { new: true }
    );

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    res.json(bed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bed statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalBeds = await Bed.countDocuments();
    const availableBeds = await Bed.countDocuments({ isBooked: false });
    const bookedBeds = await Bed.countDocuments({ isBooked: true });

    res.json({
      total: totalBeds,
      available: availableBeds,
      booked: bookedBeds
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 