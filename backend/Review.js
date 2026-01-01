const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  text: String,
  userName: String,
  date: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true },
  photo: String,
  verified: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 },
  reports: { type: Number, default: 0 },
  replies: [replySchema],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);