import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['standard', 'artist', 'admin'],
    default: 'standard'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // Loyalty program fields
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  loyaltyTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate loyalty tier based on total spent
userSchema.methods.calculateLoyaltyTier = function() {
  if (this.totalSpent >= 10000) {
    return 'platinum';
  } else if (this.totalSpent >= 5000) {
    return 'gold';
  } else if (this.totalSpent >= 1000) {
    return 'silver';
  }
  return 'bronze';
};

// Add loyalty points (1 point per dollar spent)
userSchema.methods.addLoyaltyPoints = function(amount) {
  const pointsEarned = Math.floor(amount);
  this.loyaltyPoints += pointsEarned;
  this.totalSpent += amount;
  this.loyaltyTier = this.calculateLoyaltyTier();
  return pointsEarned;
};

// Use loyalty points (100 points = $1 discount)
userSchema.methods.useLoyaltyPoints = function(points) {
  if (points > this.loyaltyPoints) {
    throw new Error('Insufficient loyalty points');
  }
  this.loyaltyPoints -= points;
  return points / 100; // Convert points to dollar discount
};

const User = mongoose.model('User', userSchema);

export default User;
