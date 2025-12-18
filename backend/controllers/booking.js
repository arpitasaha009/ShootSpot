import Studio from '../models/studio.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

const generateAccessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

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

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { studioId, date, startTime, endTime, notes } = req.body;
    const userId = req.user.userId;
    
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID format'
      });
    }
    
    // Validate required fields
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, start time, and end time are required'
      });
    }
    
    // Find the studio
    const studio = await Studio.findById(studioId);
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }
    
    if (!studio.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This studio is not available for booking'
      });
    }
    
    // Parse times
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (startHour >= endHour) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    
    const totalHours = endHour - startHour;
    const totalAmount = totalHours * studio.hourlyRate;
    
    // Check if the time slot is available
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Find conflicting bookings
    const conflictingBookings = await Booking.find({
      studio: studioId,
      date: {
        $gte: bookingDate,
        $lt: nextDay
      },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'The selected time slot is not available'
      });
    }
    
    // ✅ GENERATE ACCESS CODE
    const accessCode = generateAccessCode();
    
    // Create the booking
    const newBooking = new Booking({
      studio: studioId,
      user: userId,
      date: bookingDate,
      startTime,
      endTime,
      totalHours,
      totalAmount,
      accessCode,  // ✅ ADD THIS
      notes
    });
    
    const savedBooking = await newBooking.save();
    
    // Get user details for the email
    const user = await User.findById(userId);
    
    // Format date for email
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // ✅ ENHANCED EMAIL WITH ALL REQUIRED INFO
    const emailSubject = `Booking Confirmation - ${studio.name} [Booking ID: ${savedBooking._id}]`;
    const emailText = `
Hello ${user.name},

Your studio booking has been successfully confirmed!

═══════════════════════════════════════════════════════
BOOKING DETAILS
═══════════════════════════════════════════════════════

Booking ID: ${savedBooking._id}
Access Code: ${accessCode}

Studio Information:
- Name: ${studio.name}
- Type: ${studio.type === 'practice' ? 'Practice Room' : 'Recording Studio'}
- Location: ${studio.location}
- Date: ${formattedDate}
- Time: ${startTime} to ${endTime}
- Duration: ${totalHours} hour(s)
- Hourly Rate: $${studio.hourlyRate}
- Total Amount: $${totalAmount}

═══════════════════════════════════════════════════════
ACCESS CODE
═══════════════════════════════════════════════════════

Your access code: ${accessCode}

Please present this code at the studio reception to gain entry.
Keep this code secure and do not share it with others.

═══════════════════════════════════════════════════════
STUDIO EQUIPMENT & AMENITIES
═══════════════════════════════════════════════════════

${studio.amenities && studio.amenities.length > 0 
  ? studio.amenities.map(item => `✓ ${item}`).join('\\n')
  : 'Please contact the studio for equipment details.'}

Capacity: ${studio.capacity ? `${studio.capacity} people` : 'Contact studio for details'}

═══════════════════════════════════════════════════════
STUDIO RULES & GUIDELINES
═══════════════════════════════════════════════════════

1. Arrive on time - Late arrivals may result in reduced session time
2. Respect studio equipment - Handle all gear with care
3. No smoking or food/drinks near equipment
4. Clean up your space before leaving
5. Report any damage or issues immediately
6. Maximum occupancy must not be exceeded
7. Keep noise levels appropriate for the facility

═══════════════════════════════════════════════════════
CANCELLATION POLICY
═══════════════════════════════════════════════════════

Full Refund: Cancel 48+ hours before booking
50% Refund: Cancel 24-48 hours before booking
No Refund: Cancel less than 24 hours before booking

To cancel your booking, please visit your account dashboard or contact support.

═══════════════════════════════════════════════════════

Booking Status: ${savedBooking.status.toUpperCase()}
Payment Status: ${savedBooking.paymentStatus.toUpperCase()}

You can view your booking details and manage your reservations by logging into your account at ${process.env.CLIENT_URL}/dashboard

Questions? Contact us at ${process.env.EMAIL_FROM}

Thank you for choosing ShootSpot!

Best regards,
The ShootSpot Team
    `;
    
    await sendEmail(user.email, emailSubject, emailText);
    
    // ✅ RETURN FULL BOOKING DETAILS INCLUDING ACCESS CODE
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        ...savedBooking.toObject(),
        studio: {
          name: studio.name,
          type: studio.type,
          location: studio.location,
          amenities: studio.amenities,
          capacity: studio.capacity
        }
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};