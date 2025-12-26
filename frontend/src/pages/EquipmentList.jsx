import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const EquipmentList = () => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchInstruments();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    // For now, hardcode categories based on the task
    setCategories(['cameras', 'lenses', 'lights', 'tripods', 'audio gear']);
  };

  const fetchInstruments = async () => {
    try {
      setLoading(true);
      let url = '/instruments';

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('type', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`${url}?${params.toString()}`);
      setInstruments(response.data.instruments);
      console.log(response.data.instruments);
      setError(null);
    } catch (err) {
      setError('Failed to fetch instruments. Please try again later.');
      console.error('Error fetching instruments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading && instruments.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-white text-xl">Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar />
      <div className="flex-1 p-8">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold text-white mb-8 leading-tight">Equipment Rental</h1>

          {/* Search and Filters */}
          <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <div>
                <h3 className="text-white font-semibold mb-2">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        selectedCategory === category
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Grid */}
          {error ? (
            <div className="bg-red-500 text-white p-4 rounded-md mb-6">
              {error}
            </div>
          ) : instruments.length === 0 ? (
            <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white text-center">
              No equipment found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {instruments.map(instrument => (
                <div key={instrument._id} className="bg-black/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/30 transition-transform hover:scale-105">
                  <a href={`/instruments/${instrument._id}`}>
                    <img
                      src={`http://127.0.0.1:5000${instrument.images[0]}`}
                      alt={instrument.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg">{instrument.name}</h3>
                      <p className="text-white/70 text-sm">{instrument.brand}</p>
                      <p className="text-white/70 text-sm">Condition: {instrument.condition}</p>
                      <p className="text-blue-400 font-bold mt-2">${instrument.dailyRate.toFixed(2)}/day</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <footer className="bg-black bg-opacity-50 text-center p-4">
        <p>© 2025 ShootSpot. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default EquipmentList;
