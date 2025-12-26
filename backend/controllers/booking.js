import Studio from '../models/Studio.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

// Get all studios with filtering by location, type, and setup
export const getAllStudios = async (req, res) => {
  try {
    const { type, location, setup } = req.query;
    
    let query = { isActive: true };
    
    // Filter by studio type (practice/studio)
    if (type && ['practice', 'studio'].includes(type)) {
      query.type = type;
    }
    
    // Filter by location (case-insensitive search)
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Filter by setup type (portrait/product/green screen)
    if (setup && ['portrait', 'product', 'green screen'].includes(setup)) {
      query.setup = setup;
    }
    
    const studios = await Studio.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: studios.length,
      studios
    });
  } catch (error) {
    console.error('Error fetching studios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studios',
      error: error.message
    });
  }
};

// Get studio by ID
export const getStudioById = async (req, res) => {
  try {
    const { studioId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID format'
      });
    }
    
    const studio = await Studio.findById(studioId);
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }
    
    res.status(200).json({
      success: true,
      studio
    });
  } catch (error) {
    console.error('Error fetching studio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studio',
      error: error.message
    });
  }
};

// Check studio availability for a specific date
export const checkStudioAvailability = async (req, res) => {
  try {
    const { studioId } = req.params;
    const { date } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID format'
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Convert date string to Date object
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Find all bookings for the studio on the specified date
    const bookings = await Booking.find({
      studio: studioId,
      date: {
        $gte: searchDate,
        $lt: nextDay
      },
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');
    
    // Create an array of all hours in the day (assuming 24-hour operation)
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}:00` : `${i}:00`;
      hours.push({
        time: hour,
        available: true
      });
    }
    
    // Mark booked hours as unavailable
    bookings.forEach(booking => {
      const startHour = parseInt(booking.startTime.split(':')[0]);
      const endHour = parseInt(booking.endTime.split(':')[0]);
      
      for (let i = startHour; i < endHour; i++) {
        const index = hours.findIndex(h => h.time === (i < 10 ? `0${i}:00` : `${i}:00`));
        if (index !== -1) {
          hours[index].available = false;
        }
      }
    });
    
    res.status(200).json({
      success: true,
      date: searchDate,
      availability: hours
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
};