import express from 'express';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { upload } from '../controllers/media.js';
import * as equipmentController from '../controllers/equipment.js';
import * as equipmentRentalController from '../controllers/equipmentRental.js';

const router = express.Router();

// Equipment routes
router.post('/equipments', auth, isAdmin, upload.array('images', 5), equipmentController.createEquipment);
router.get('/equipments', equipmentController.getAllEquipments);
router.get('/equipments/:equipmentId', equipmentController.getEquipmentById);
router.put('/equipments/:equipmentId', auth, isAdmin, upload.array('images', 5), equipmentController.updateEquipment);
router.delete('/equipments/:equipmentId', auth, isAdmin, equipmentController.deleteEquipment);
router.get('/equipments/:equipmentId/availability', equipmentController.checkEquipmentAvailability);

// Equipment rental routes
router.post('/rentals', auth, equipmentRentalController.createRental);
router.get('/rentals/user', auth, equipmentRentalController.getUserRentals);
router.get('/rentals/:rentalId', auth, equipmentRentalController.getRentalById);
router.put('/rentals/:rentalId/status', auth, equipmentRentalController.updateRentalStatus);
router.put('/rentals/:rentalId/payment', auth, isAdmin, equipmentRentalController.updatePaymentStatus);
router.get('/equipments/:equipmentId/rentals', auth, isAdmin, equipmentRentalController.getEquipmentRentals);
router.get('/rentals', auth, isAdmin, equipmentRentalController.getAllRentals);
router.put('/rentals/:rentalId/cancel', auth, equipmentRentalController.cancelRental);

export default router;
