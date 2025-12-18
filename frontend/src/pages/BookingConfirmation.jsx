import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { FaCheckCircle, FaCopy, FaDownload, FaPrint } from 'react-icons/fa';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.booking);
      setError(null);
    } catch (err) {
      setError('Failed to fetch booking details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyAccessCode = () => {
    navigator.clipboard.writeText(booking.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printConfirmation = () => {
    window.print();
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

  if (error || !booking) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
        <Navbar showLogin={true} showSignup={true} />
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-red-500/20 border border-red-500 text-white p-6 rounded-lg max-w-md">
            <p>{error || 'Booking not found'}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
            >
              Go to Dashboard
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
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-gray-300">Your studio has been successfully booked</p>
          </div>

          {/* Main Confirmation Card */}
          <div className="bg-black/60 rounded-lg p-8 border border-gray-700 mb-6">
            {/* Booking ID & Access Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-700">
              <div>
                <p className="text-sm text-gray-400 mb-1">Booking ID</p>
                <p className="text-xl font-mono">{booking._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Access Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-green-400 font-mono">{booking.accessCode}</p>
                  <button
                    onClick={copyAccessCode}
                    className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                    title="Copy access code"
                  >
                    {copied ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Present this code at reception</p>
              </div>
            </div>

            {/* Studio Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Studio Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Studio Name</p>
                  <p className="text-lg font-semibold">{booking.studio.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Type</p>
                  <p className="text-lg">{booking.studio.type === 'practice' ? 'Practice Room' : 'Recording Studio'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-lg">{booking.studio.location}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Date</p>
                  <p className="text-lg">{new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Time</p>
                  <p className="text-lg">{booking.startTime} - {booking.endTime}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Duration</p>
                  <p className="text-lg">{booking.totalHours} hour(s)</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-400">${booking.totalAmount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment & Amenities */}
            <div className="mb-8 pb-8 border-b border-gray-700">
              <h3 className="text-xl font-bold mb-3">Available Equipment & Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {booking.studio.amenities && booking.studio.amenities.length > 0 ? (
                  booking.studio.amenities.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-md">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 col-span-full">Contact studio for equipment details</p>
                )}
              </div>
            </div>

            {/* Studio Rules */}
            <div className="mb-8 pb-8 border-b border-gray-700">
              <h3 className="text-xl font-bold mb-3">Studio Rules & Guidelines</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Arrive on time - Late arrivals may result in reduced session time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Respect studio equipment - Handle all gear with care</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>No smoking or food/drinks near equipment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Clean up your space before leaving</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Report any damage or issues immediately</span>
                </li>
              </ul>
            </div>

            {/* Cancellation Policy */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Cancellation Policy</h3>
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><strong className="text-green-400">Full Refund:</strong> Cancel 48+ hours before booking</li>
                  <li><strong className="text-yellow-400">50% Refund:</strong> Cancel 24-48 hours before booking</li>
                  <li><strong className="text-red-400">No Refund:</strong> Cancel less than 24 hours before booking</li>
                </ul>
              </div>
            </div>

            {/* Email Confirmation Note */}
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-300">
                📧 A confirmation email with all details has been sent to your registered email address.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={printConfirmation}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
            >
              <FaPrint /> Print Confirmation
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/book-studio')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
            >
              Book Another Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;