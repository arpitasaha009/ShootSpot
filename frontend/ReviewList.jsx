import React from 'react';
import useReviewStore from '../stores/reviewStore';

const ReviewList = ({ itemId }) => {
  const reviews = useReviewStore((state) => state.getReviews(itemId));

  if (!reviews.length) return <p className="text-gray-500">No reviews yet.</p>;

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-lg shadow">
          <div className="flex items-center mb-2">
            <span className="font-bold">{review.user}</span>
            <span className="ml-2 text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            <span className="ml-auto text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
          </div>
          <p className="mb-2">{review.text}</p>
          {review.photo && <img src={review.photo} alt="Review photo" className="w-48 h-48 object-cover rounded" />}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;