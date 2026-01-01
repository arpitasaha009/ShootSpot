//update studio details 
import React from 'react';
import { useParams } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

// Fake studio data (same as BookStudio for consistency)
const fakeStudios = [
  { _id: '1', name: 'Sunlit Loft Studio', location: 'Berlin Mitte', size: '800 sq ft', hourlyRate: 85 },
  { _id: '2', name: 'Industrial Black Box', location: 'Kreuzberg', size: '1200 sq ft', hourlyRate: 95 },
  { _id: '3', name: 'Natural Light Haven', location: 'Prenzlauer Berg', size: '1000 sq ft', hourlyRate: 90 },
  { _id: '4', name: 'Minimal White Space', location: 'Friedrichshain', size: '650 sq ft', hourlyRate: 75 },
];

const StudioDetail = () => {
  const { id } = useParams(); // Gets ID from URL like /studio/1
  const studio = fakeStudios.find(s => s._id === id);

  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleReviewPosted = () => {
    setRefreshKey(prev => prev + 1); // Forces ReviewList to re-fetch
  };

  if (!studio) {
    return <div className="text-center py-20 text-2xl">Studio not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Studio Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">{studio.name}</h1>
          <p className="text-xl text-gray-700 mb-2">📍 {studio.location}</p>
          <p className="text-lg text-gray-600 mb-4">Size: {studio.size}</p>
          <p className="text-3xl font-bold text-blue-600">${studio.hourlyRate}/hour</p>
        </div>

        {/* Reviews Section */}
        <ReviewForm itemId={studio._id} onReviewPosted={handleReviewPosted} />
        <ReviewList itemId={studio._id} key={refreshKey} />
      </div>
    </div>
  );
};

export default StudioDetail;