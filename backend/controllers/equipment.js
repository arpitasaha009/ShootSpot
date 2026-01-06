import Equipment from '../models/Equipment.js';
import EquipmentRental from '../models/EquipmentRental.js';
import mongoose from 'mongoose';

// Create a new equipment
export const createEquipment = async (req, res) => {
  try {
    const { name, type, description, brand, condition, dailyRate } = req.body;
    console.log('Received type:', type);
    
    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      // Create array of file paths
      images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const newEquipment = new Equipment({
      name,
      type,
      description,
      brand,
      condition,
      dailyRate,
      images
    });
    
    const savedEquipment = await newEquipment.save();
    
    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      equipment: savedEquipment
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: error.message
    });
  }
};

// Get all equipments
export const getAllEquipments = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = { isAvailable: true };
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    const equipments = await Equipment.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: equipments.length,
      equipments
    });
  } catch (error) {
    console.error('Error fetching equipments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipments',
      error: error.message
    });
  }
};

// Get equipment by ID
export const getEquipmentById = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID format'
      });
    }
    
    const equipment = await Equipment.findById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      equipment
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Update equipment
export const updateEquipment = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { name, type, description, brand, condition, dailyRate, isAvailable } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID format'
      });
    }
    
    const equipment = await Equipment.findById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    // Update fields
    equipment.name = name || equipment.name;
    equipment.type = type || equipment.type;
    equipment.description = description || equipment.description;
    equipment.brand = brand || equipment.brand;
    equipment.condition = condition || equipment.condition;
    equipment.dailyRate = dailyRate || equipment.dailyRate;
    equipment.isAvailable = isAvailable !== undefined ? isAvailable : equipment.isAvailable;
    equipment.updatedAt = Date.now();
    
    // Process uploaded images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      equipment.images = [...equipment.images, ...newImages];
    }
    
    const updatedEquipment = await equipment.save();
    
    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      equipment: updatedEquipment
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: error.message
    });
  }
};

// Delete equipment
export const deleteEquipment = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID format'
      });
    }
    
    // Check if there are any active rentals
    const activeRentals = await EquipmentRental.find({
      equipment: equipmentId,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (activeRentals.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete equipment with active rentals'
      });
    }
    
    const deletedEquipment = await Equipment.findByIdAndDelete(equipmentId);
    
    if (!deletedEquipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment',
      error: error.message
    });
  }
};

// Check equipment availability
export const checkEquipmentAvailability = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID format'
      });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    // Convert date strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Find any overlapping rentals
    const overlappingRentals = await EquipmentRental.find({
      equipment: equipmentId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // Rental starts during requested period
        { startDate: { $gte: start, $lte: end } },
        // Rental ends during requested period
        { endDate: { $gte: start, $lte: end } },
        // Rental encompasses requested period
        { startDate: { $lte: start }, endDate: { $gte: end } }
      ]
    });
    
    const isAvailable = overlappingRentals.length === 0;
    
    res.status(200).json({
      success: true,
      isAvailable,
      overlappingRentals: isAvailable ? [] : overlappingRentals
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
