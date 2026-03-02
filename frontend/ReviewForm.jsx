import React, { useState } from 'react';
import useReviewStore from '../stores/reviewStore'; // We'll create this

const ReviewForm = ({ itemId }) => { // itemId = studio/gear ID
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState('');
  const addReview = useReviewStore((state) => state.addReview);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return alert('Rating must be 1-5');
    addReview(itemId, { rating, text, photo, user: 'Demo User', date: new Date().toISOString() });
    setRating(0);
    setText('');
    setPhoto('');
    alert('Review posted! (Demo - refreshes on reload)');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-2xl font-bold mb-4">Leave a Review</h3>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Rating (1-5 stars):</label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg py-2 px-4"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Written Review:</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 px-4 h-24"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Optional Photo URL:</label>
        <input
          type="url"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 px-4"
          placeholder="https://example.com/my-photo.jpg"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700">
        Post Review
      </button>
    </form>
  );
};

export default ReviewForm;