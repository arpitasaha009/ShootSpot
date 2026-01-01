// routes/route.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { upload, uploadMultipleImages } from '../controllers/media.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Import controllers
import * as authController from '../controllers/auth.js';
import * as userController from '../controllers/user.js';
import * as studioController from '../controllers/studio.js';
import * as bookingController from '../controllers/booking.js';
import * as instrumentController from '../controllers/instrument.js';
import * as productController from '../controllers/product.js';
import * as cartController from '../controllers/cart.js';

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

// Instrument rental routes
router.post('/rentals', auth, instrumentRentalController.createRental);
router.get('/rentals/user', auth, instrumentRentalController.getUserRentals);
router.get('/rentals/:rentalId', auth, instrumentRentalController.getRentalById);
router.put('/rentals/:rentalId/status', auth, instrumentRentalController.updateRentalStatus);
router.put('/rentals/:rentalId/payment', auth, isAdmin, instrumentRentalController.updatePaymentStatus);
router.get('/instruments/:instrumentId/rentals', auth, isAdmin, instrumentRentalController.getInstrumentRentals);
router.get('/rentals', auth, isAdmin, instrumentRentalController.getAllRentals);
router.put('/rentals/:rentalId/cancel', auth, instrumentRentalController.cancelRental);

// ============================================
// PRODUCT ROUTES
// ============================================
// Public routes
router.get('/products', productController.getProducts);
router.get('/products/categories', productController.getCategories);
router.get('/products/brands', productController.getBrands);
router.get('/products/:id', productController.getProductById);

// Product review routes
router.get('/products/:id/reviews', productController.getProductReviews);

// Protected review routes (require authentication)
router.post('/products/:id/reviews', auth, productController.addReview);
router.put('/products/:id/reviews/:reviewId', auth, productController.updateReview);
router.delete('/products/:id/reviews/:reviewId', auth, productController.deleteReview);

// Admin routes
router.post(
  '/products',
  auth,
  isAdmin,
  upload.array('images', 5),
  uploadMultipleImages,
  productController.createProduct
);

router.put(
  '/products/:id',
  auth,
  isAdmin,
  upload.array('images', 5),
  uploadMultipleImages,
  productController.updateProduct
);

router.delete('/products/:id', auth, isAdmin, productController.deleteProduct);

// ============================================
// CART ROUTES
// ============================================
// All cart routes require authentication
router.get('/cart', auth, cartController.getCart);
router.post('/cart/add', auth, cartController.addToCart);
router.put('/cart/update', auth, cartController.updateCartItem);
router.delete('/cart/remove/:productId', auth, cartController.removeCartItem);
router.delete('/cart/clear', auth, cartController.clearCart);
router.post('/cart/apply-loyalty', auth, cartController.applyLoyaltyDiscount);

// ============================================
// CHECKOUT & ORDER ROUTES
// ============================================
router.post('/checkout', auth, cartController.checkout);
router.get('/orders', auth, cartController.getOrders);
router.get('/orders/:orderId', auth, cartController.getOrderById);

// ============================================
// LOYALTY ROUTES
// ============================================
router.get('/loyalty/points', auth, async (req, res) => {
  try {
    const User = await import('../models/user.js');
    const user = await User.default.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ 
      points: user.loyaltyPoints,
      tier: user.loyaltyTier,
      totalSpent: user.totalSpent
    });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
