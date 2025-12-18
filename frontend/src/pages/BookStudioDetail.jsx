import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';

const BookStudioDetail = () => {
  const { studioId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Booking form fields - Complete requirement implementation
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
  );
  const [bookingType, setBookingType] = useState('hourly');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [setup, setSetup] = useState('portrait');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchStudioDetails();
  }, [studioId]);

  const fetchStudioDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/studios/${studioId}`);
      setStudio(response.data.studio);
      
      // Set first available setup as default if available
      if (response.data.studio.setup && response.data.studio.setup.length > 0) {
        setSetup(response.data.studio.setup[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch studio details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate end time based on booking type
  useEffect(() => {
    if (bookingType === 'half-day') {
      const start = parseInt(startTime.split(':')[0]);
      const end = start + 4;
      setEndTime(`${end.toString().padStart(2, '0')}:00`);
    } else if (bookingType === 'full-day') {
      const start = parseInt(startTime.split(':')[0]);
      const end = start + 8;
      setEndTime(`${end.toString().padStart(2, '0')}:00`);
    }
  }, [bookingType, startTime]);

  // Calculate total hours based on booking type
  const calculateHours = () => {
    if (bookingType === 'half-day') {
      return 4;
    } else if (bookingType === 'full-day') {
      return 8;
    } else {
      // hourly
      const start = parseInt(startTime.split(':')[0]);
      const end = parseInt(endTime.split(':')[0]);
      return Math.max(0, end - start);
    }
  };

  // Calculate total cost
  const calculateTotal = () => {
    if (!studio) return 0;
    return calculateHours() * studio.hourlyRate;
  };

  // Validate time selection
  const validateTimes = () => {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    
    if (bookingType === 'hourly' && start >= end) {
      setError('End time must be after start time');
      return false;
    }
    
    if (start < 0 || start > 23 || end < 0 || end > 24) {
      setError('Invalid time selection');
      return false;
    }
    
    return true;
  };

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateTimes()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const bookingData = {
        studioId,
        date: selectedDate,
        startTime,
        endTime,
        bookingType,    // hourly/half-day/full-day
        setup,          // portrait/product/green screen
        notes
      };
      
      const response = await api.post('/bookings', bookingData);
      
      if (response.data.success) {
        // Navigate to confirmation page
        navigate(`/booking-confirmation/${response.data.booking._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error('Error creating booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
        <Navbar showLogin={true} showSignup={true} />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
        <Navbar showLogin={true} showSignup={true} />
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-red-500/20 border border-red-500 text-white p-6 rounded-lg max-w-md">
            <p className="mb-4">Studio not found</p>
            <button 
              onClick={() => navigate('/book-studio')}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
            >
              Back to Studios
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
      <Navbar showLogin={true} showSignup={true} />
      
      <div className="flex-1 p-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/book-studio')}
              className="text-gray-400 hover:text-white mb-4 flex items-center"
            >
              ← Back to Studios
            </button>
            <h1 className="text-4xl font-bold">Complete Your Booking</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Studio Details Card */}
            <div className="bg-black/60 rounded-lg p-6 border border-gray-700 h-fit">
              <h2 className="text-2xl font-bold mb-4">{studio.name}</h2>
              
              {/* Studio Image */}
              {studio.images && studio.images.length > 0 && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={`http://127.0.0.1:5000${studio.images[0]}`}
                    alt={studio.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              
              {/* Studio Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">📍</span>
                  <span>{studio.location}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="bg-purple-900 text-white text-xs px-3 py-1 rounded-full">
                    {studio.type === 'practice' ? 'Practice Room' : 'Recording Studio'}
                  </span>
                </div>
                
                {studio.capacity && (
                  <div className="flex items-center text-gray-300">
                    <span className="text-purple-400 mr-2">👥</span>
                    <span>Capacity: {studio.capacity} people</span>
                  </div>
                )}
              </div>
              
              {/* Description */}
              {studio.description && (
                <div className="mb-4">
                  <p className="text-gray-300 text-sm">{studio.description}</p>
                </div>
              )}
              
              {/* Available Setups */}
              {studio.setup && studio.setup.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Available Setups</h3>
                  <div className="flex flex-wrap gap-2">
                    {studio.setup.map((setupItem, index) => (
                      <span 
                        key={index}
                        className="bg-green-900/50 text-green-300 text-sm px-3 py-1 rounded-full"
                      >
                        {setupItem.charAt(0).toUpperCase() + setupItem.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Amenities */}
              {studio.amenities && studio.amenities.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Amenities & Equipment</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {studio.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-300">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pricing */}
              <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Hourly Rate:</span>
                  <span className="text-2xl font-bold text-purple-400">
                    ${studio.hourlyRate}/hour
                  </span>
                </div>
              </div>
            </div>
            
            {/* Booking Form Card */}
            <div className="bg-black/60 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Booking Details</h2>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Booking Type (Hourly/Half-day/Full-day) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Booking Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="half-day">Half Day (4 hours)</option>
                    <option value="full-day">Full Day (8 hours)</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {bookingType === 'hourly' && 'Choose your preferred hours'}
                    {bookingType === 'half-day' && '4 consecutive hours of studio time'}
                    {bookingType === 'full-day' && '8 consecutive hours of studio time'}
                  </p>
                </div>
                
                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Time {bookingType !== 'hourly' && '(Auto)'}
                    </label>
                    {bookingType === 'hourly' ? (
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <input
                        type="time"
                        value={endTime}
                        disabled
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-gray-400 cursor-not-allowed"
                      />
                    )}
                  </div>
                </div>
                
                {/* Setup Type (Portrait/Product/Green Screen) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Setup Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={setup}
                    onChange={(e) => setSetup(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {studio.setup && studio.setup.length > 0 ? (
                      studio.setup.map((setupOption) => (
                        <option key={setupOption} value={setupOption}>
                          {setupOption.charAt(0).toUpperCase() + setupOption.slice(1)}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="portrait">Portrait</option>
                        <option value="product">Product</option>
                        <option value="green screen">Green Screen</option>
                      </>
                    )}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {setup === 'portrait' && 'Ideal for headshots, family photos, and personal portraits'}
                    {setup === 'product' && 'Perfect for e-commerce, catalog, and product photography'}
                    {setup === 'green screen' && 'Professional chroma key setup for creative compositing'}
                  </p>
                </div>
                
                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    placeholder="Any special requirements or notes for the studio..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                
                {/* Booking Summary */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="font-medium">{calculateHours()} hour{calculateHours() !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rate:</span>
                      <span className="font-medium">${studio.hourlyRate}/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Setup:</span>
                      <span className="font-medium capitalize">{setup}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Cost:</span>
                        <span className="text-2xl font-bold text-purple-400">
                          ${calculateTotal()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || calculateHours() <= 0}
                  className={`w-full ${
                    submitting || calculateHours() <= 0
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white py-3 rounded-md font-semibold transition-colors flex items-center justify-center`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </>
                  ) : (
                    <>Confirm Booking - ${calculateTotal()}</>
                  )}
                </button>
                
                {calculateHours() <= 0 && bookingType === 'hourly' && (
                  <p className="text-xs text-red-400 text-center">
                    Please select valid start and end times
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookStudioDetail;