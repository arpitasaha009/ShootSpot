import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaPhotoVideo} from 'react-icons/fa';
const RentEquipment = () => {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [rentalDates, setRentalDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [notes, setNotes] = useState('');
  const [rentalSuccess, setRentalSuccess] = useState(false);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/r/equipments');
        
        // Ensure equipments is always an array
        const equipmentsData = response.data.equipments || response.data;
        console.log(equipmentsData)
        // Check if equipmentsData is an array, if not, convert or use empty array
        setEquipments(Array.isArray(equipmentsData) ? equipmentsData : []);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load equipments. Please try again later.');
        setLoading(false);
        console.error('Error fetching equipments:', err);
      }
    };
    
    

    fetchEquipments();
  }, []);

  const handleEquipmentSelect = (equipment) => {
    setSelectedEquipment(equipment);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setRentalDates({
      ...rentalDates,
      [name]: value
    });
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEquipment) {
      setError('Please select an equipment');
      return;
    }
    
    if (!rentalDates.startDate || !rentalDates.endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    try {
      const response = await api.post('/r/rentals', {
        equipmentId: selectedEquipment._id,
        startDate: rentalDates.startDate,
        endDate: rentalDates.endDate,
        notes
      });
      
      setRentalSuccess(true);
      setError(null);
      
      // Reset form
      setSelectedEquipment(null);
      setRentalDates({ startDate: '', endDate: '' });
      setNotes('');
      
      // Redirect to user rentals after 2 seconds
      setTimeout(() => {
        navigate('/users/rentals');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create rental. Please try again.');
      console.error('Error creating rental:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Rent an Equipment</h1>
        
        {rentalSuccess ? (
          <div className="bg-green-800 p-8 rounded-lg text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Rental Successful!</h2>
            <p className="text-gray-300 mb-8">
              Your equipment rental has been confirmed. Redirecting to your rentals...
            </p>
          </div>
        ) : equipments.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
             <div className="text-6xl mb-4"><FaPhotoVideo size={64} className="text-white" /></div>
            <h2 className="text-2xl font-bold mb-4">No Equipments Available</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              There are currently no equipments available for rent. Please check back later.
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Back to Booking Options
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Equipment Selection */}
            <div className="md:col-span-2 lg:col-span-3">
              <h2 className="text-2xl font-semibold mb-4">Select an Equipment</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipments.map((equipment) => (
                  <div 
                    key={equipment._id}
                    className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition-all ${
                      selectedEquipment?._id === equipment._id 
                        ? 'ring-2 ring-purple-500 transform scale-105' 
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleEquipmentSelect(equipment)}
                  >
                    {equipment.images && equipment.images.length > 0 ? (
                      <img 
                        src={`http://127.0.0.1:5000${equipment.images[0]}`}
                        alt={equipment.name} 
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded-md mb-4">
                        <FaPhotoVideo size={64} className="text-white" />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold">{equipment.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{equipment.type} • {equipment.brand}</p>
                    <p className="text-gray-300 mb-3 text-sm line-clamp-2">{equipment.description}</p>
                    <p className="text-purple-400 font-semibold">${equipment.dailyRate}/day</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rental Form */}
            {selectedEquipment && (
              <div className="md:col-span-2 lg:col-span-3 mt-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">Rental Details</h2>
                  
                  {error && (
                    <div className="bg-red-800 p-4 rounded-lg mb-6">
                      <p>{error}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-gray-300 mb-2">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={rentalDates.startDate}
                          onChange={handleDateChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={rentalDates.endDate}
                          onChange={handleDateChange}
                          min={rentalDates.startDate || new Date().toISOString().split('T')[0]}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-300 mb-2">Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={notes}
                        onChange={handleNotesChange}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                        placeholder="Any special requests or notes for your rental..."
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => navigate('/booking')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-colors"
                      >
                        Back to Booking Options
                      </button>
                      <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors"
                      >
                        Confirm Rental
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentEquipment;
