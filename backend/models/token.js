import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['refresh'],
    default: 'refresh'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  blacklisted: {
    type: Boolean,
    default: false
  }
});

// Create index for better query performance
tokenSchema.index({ userId: 1 });
tokenSchema.index({ token: 1 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;
