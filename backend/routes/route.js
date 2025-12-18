// routes/route.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../controllers/media.js';

const router = express.Router();

// Import controllers
import * as authController from '../controllers/auth.js';
import * as userController from '../controllers/user.js';
import * as studioController from '../controllers/studio.js';
import * as bookingController from '../controllers/booking.js';

// ============================================
// AUTHENTICATION ROUTES
// ============================================
router.post('/auth/register', (req, res) => {
  authController.register(req, res);
});

router.post('/auth/login', (req, res) => {
  authController.login(req, res);
});

router.post('/auth/logout', auth, (req, res) => {
  authController.logout(req, res);
});

router.post('/auth/refresh-token', (req, res) => {
  authController.refreshToken(req, res);
});

// ============================================
// USER ROUTES
// ============================================
router.get('/users/profile', auth, (req, res) => {
  userController.getProfile(req, res);
});

router.put('/users/profile', auth, (req, res) => {
  userController.updateProfile(req, res);
});

// ============================================
// STUDIO ROUTES (Browse & Filter)
// ============================================
// Get all studios with filtering by location, type, and setup
router.get('/studios', (req, res) => {
  studioController.getAllStudios(req, res);
});

// Get studio by ID (view details before booking)
router.get('/studios/:studioId', (req, res) => {
  studioController.getStudioById(req, res);
});

// Check studio availability for a specific date
router.get('/studios/:studioId/availability', (req, res) => {
  studioController.checkStudioAvailability(req, res);
});

// ============================================
// BOOKING ROUTES
// ============================================
// Create a new booking (with location, date, time, type, setup)
router.post('/bookings', auth, (req, res) => {
  bookingController.createBooking(req, res);
});

// Get user's bookings
router.get('/bookings/user', auth, (req, res) => {
  bookingController.getUserBookings(req, res);
});

// Get booking by ID (for confirmation page)
router.get('/bookings/:bookingId', auth, (req, res) => {
  bookingController.getBookingById(req, res);
});

export default router;