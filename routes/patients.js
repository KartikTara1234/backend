const express = require('express');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
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

// Get all patients
router.get('/', auth, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unpaid patients only
router.get('/unpaid', auth, async (req, res) => {
  try {
    const patients = await Patient.find({ fees: 'UNPAID' }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new patient
router.post('/', auth, async (req, res) => {
  try {
    const { name, time, fees, amount, doctor, treatment, receivedBy, medications } = req.body;

    // Validate medications if provided
    if (medications && medications.length > 0) {
      for (const med of medications) {
        if (!med.medicineId || !med.quantity || med.quantity < 1) {
          return res.status(400).json({ message: 'Invalid medication data' });
        }

        const medicine = await Medicine.findById(med.medicineId);
        if (!medicine) {
          return res.status(404).json({ message: `Medicine with ID ${med.medicineId} not found` });
        }

        // Check stock
        if (medicine.quantity < med.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${medicine.medicineName}. Available: ${medicine.quantity}` });
        }

        // Check expiry
        if (medicine.expiryDate < new Date()) {
          return res.status(400).json({ message: `${medicine.medicineName} has expired` });
        }
      }

      // Update medicine stock
      for (const med of medications) {
        await Medicine.findByIdAndUpdate(med.medicineId, {
          $inc: { quantity: -med.quantity }
        });
      }
    }

    const patient = new Patient({
      name,
      time,
      fees,
      amount: fees === 'UNPAID' ? amount : 0,
      doctor,
      treatment,
      receivedBy: receivedBy || '',
      medications: medications ? medications.map(med => ({
        medicine: med.medicineId,
        quantity: med.quantity
      })) : []
    });

    await patient.save();
    await patient.populate('medications.medicine');
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, time, fees, amount, doctor, treatment, receivedBy } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        name,
        time,
        fees,
        amount: fees === 'UNPAID' ? amount : 0,
        doctor,
        treatment,
        receivedBy: receivedBy || ''
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete patient
router.delete('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign medications to patient
router.put('/:id/medications', auth, async (req, res) => {
  try {
    const { medications } = req.body; // Array of { medicineId, quantity }

    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({ message: 'Medications array is required' });
    }

    // Validate each medication
    for (const med of medications) {
      if (!med.medicineId || !med.quantity || med.quantity < 1) {
        return res.status(400).json({ message: 'Invalid medication data' });
      }

      const medicine = await Medicine.findById(med.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine with ID ${med.medicineId} not found` });
      }

      // Check stock
      if (medicine.quantity < med.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${medicine.medicineName}. Available: ${medicine.quantity}` });
      }

      // Check expiry
      if (medicine.expiryDate < new Date()) {
        return res.status(400).json({ message: `${medicine.medicineName} has expired` });
      }
    }

    // Update medicine stock
    for (const med of medications) {
      await Medicine.findByIdAndUpdate(med.medicineId, {
        $inc: { quantity: -med.quantity }
      });
    }

    // Update patient medications
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          medications: medications.map(med => ({
            medicine: med.medicineId,
            quantity: med.quantity
          }))
        }
      },
      { new: true }
    ).populate('medications.medicine');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
