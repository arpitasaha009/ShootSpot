//update studio details 
import React from 'react';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import useReviewStore from '../stores/reviewStore';

const StudioDetail = ({ studio }) => { // Pass studio prop or use ID
  const averageRating = useReviewStore((state) => state.getAverageRating(studio._id));
  const reviewCount = useReviewStore((state) => state.getReviewCount(studio._id));

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">{studio.name}</h1>
      {/* Other studio details... */}
      <div className="mb-6">
        <p className="text-xl font-bold">
          Average Rating: {averageRating} ★ ({reviewCount} reviews)
        </p>
      </div>
      <ReviewList itemId={studio._id} />
      <ReviewForm itemId={studio._id} />
    </div>
  );
};

export default StudioDetail;