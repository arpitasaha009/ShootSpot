import React, { useState } from 'react';
import api from '../api/axios';

const ReviewForm = ({ itemId, onReviewPosted }) => {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/reviews', {
        itemId,
        rating,
        text,
        photo: photo || null,
        userId: 'user123', // Replace with real auth later
        userName: 'John Doe',
        verified: true
      });

      setText('');
      setPhoto('');
      setRating(5);
      onReviewPosted();
    } catch (err) {
      setError('Failed to post review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-4">
        <label className="block font-medium mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border rounded-lg p-3 mb-4"
        rows="4"
        placeholder="Share your experience..."
        required
      />

      <input
        type="url"
        value={photo}
        onChange={(e) => setPhoto(e.target.value)}
        className="w-full border rounded-lg p-3 mb-4"
        placeholder="Photo URL (optional)"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
};

export default ReviewForm;