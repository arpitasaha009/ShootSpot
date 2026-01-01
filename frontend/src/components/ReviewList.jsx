import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ReviewList = ({ itemId }) => {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${itemId}?sort=${sort}`);
      setReviews(res.data.reviews);
      setAverage(res.data.average);
      setCount(res.data.count);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [itemId, sort]);

  if (loading) return <p>Loading reviews...</p>;
  if (count === 0) return <p>No reviews yet. Be the first!</p>;

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold">
            Reviews ({count})
          </h3>
          <p className="text-lg">
            Average Rating: {average} ★★★★☆
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold">{review.userName}</p>
                <p className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                {review.verified && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Verified Buyer</span>}
              </div>
              <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
            </div>
            <p className="mb-3">{review.text}</p>
            {review.photo && <img src={review.photo} alt="Review" className="w-64 h-64 object-cover rounded mb-3" />}
            <div className="text-sm text-gray-600">
              <button className="mr-4">👍 Helpful ({review.helpful})</button>
              <button className="text-red-500">Report</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;