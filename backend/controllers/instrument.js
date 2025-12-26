import Instrument from '../models/Instrument.js';
import InstrumentRental from '../models/InstrumentRental.js';
import mongoose from 'mongoose';

// Get all instruments
export const getAllInstruments = async (req, res) => {
  try {
    const { type } = req.query;

    let query = { isAvailable: true };

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    const instruments = await Instrument.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: instruments.length,
      instruments
    });
  } catch (error) {
    console.error('Error fetching instruments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instruments',
      error: error.message
    });
  }
};

// Get instrument by ID
export const getInstrumentById = async (req, res) => {
  try {
    const { instrumentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(instrumentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instrument ID format'
      });
    }

    const instrument = await Instrument.findById(instrumentId);

    if (!instrument) {
      return res.status(404).json({
        success: false,
        message: 'Instrument not found'
      });
    }

    res.status(200).json({
      success: true,
      instrument
    });
  } catch (error) {
    console.error('Error fetching instrument:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instrument',
      error: error.message
    });
  }
};
