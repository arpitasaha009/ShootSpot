import mongoose from 'mongoose';
// Force restart
delete mongoose.models.Equipment;

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Camera Equipment', 'Lenses', 'Lighting Equipment', 'Light Modifiers', 'Camera Support', 'Background & Backdrops', 'Power & Accessories', 'Audio Accessories', 'Studio Furniture', 'Props & Styling', 'Storage & Maintenance'],
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;
