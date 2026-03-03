const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// POST: Create a new review
router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Fetch reviews for an item with sorting
router.get('/:itemId', async (req, res) => {
  try {
    const { sort = 'recent' } = req.query;
    let sortObj = { date: -1 };
    if (sort === 'highest') sortObj = { rating: -1 };
    if (sort === 'helpful') sortObj = { helpful: -1 };

    const reviews = await Review.find({ itemId: req.params.itemId }).sort(sortObj);
    const count = reviews.length;
    const average = count > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
      : 0;

    res.json({ reviews, average, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Edit review
router.put('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Delete review
router.delete('/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add reply
router.post('/:id/reply', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    review.replies.push(req.body);
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Helpful vote
router.post('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Report review
router.post('/:id/report', async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { $inc: { reports: 1 } });
    res.json({ message: 'Review reported' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;