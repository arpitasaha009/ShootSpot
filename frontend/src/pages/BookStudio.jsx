import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Added this import

const fakeStudios = [
  {
    _id: "1",
    name: "Sunlit Loft Studio",
    location: "Berlin Mitte",
    size: "800 sq ft",
    amenities: ["White backdrop", "Softbox lights", "C-stands", "Makeup station"],
    hourlyRate: 85,
    images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800"]
  },
  {
    _id: "2",
    name: "Industrial Black Box",
    location: "Kreuzberg",
    size: "1200 sq ft",
    amenities: ["Black walls", "Strobe lights", "Color gels", "Fog machine"],
    hourlyRate: 95,
    images: ["https://images.unsplash.com/photo-1516035069373-6f44e3a6c4f0?w=800"]
  },
  {
    _id: "3",
    name: "Natural Light Haven",
    location: "Prenzlauer Berg",
    size: "1000 sq ft",
    amenities: ["Large windows", "Reflector kit", "Seamless paper rolls", "Props rack"],
    hourlyRate: 90,
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]
  },
  {
    _id: "4",
    name: "Minimal White Space",
    location: "Friedrichshain",
    size: "650 sq ft",
    amenities: ["Cyclorama wall", "Beauty dish", "V-flats", "Changing room"],
    hourlyRate: 75,
    images: ["https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800"]
  }
];

const BookStudio = () => {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 pt-12">
        <h1 className="text-5xl font-bold text-center mb-10 text-gray-800">
          Browse Professional Photography Studios
        </h1>

        <div className="mb-10 flex justify-center">
          <input
            type="date"
            value={selectedDate}
            readOnly
            className="bg-white border border-gray-300 rounded-lg py-3 px-6 text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fakeStudios.map((studio) => (
            <div key={studio._id} className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
              <div className="h-64">
                <img
                  src={studio.images[0]}
                  alt={studio.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{studio.name}</h2>
                <p className="text-gray-600 mb-3">📍 {studio.location}</p>
                <p className="text-gray-700 mb-4"><strong>Size:</strong> {studio.size}</p>

                <div className="mb-5">
                  <p className="font-semibold text-gray-700 mb-2">Equipment:</p>
                  <div className="flex flex-wrap gap-2">
                    {studio.amenities.map((item, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-3xl font-bold text-blue-600">
                    ${studio.hourlyRate}/hour
                  </p>
                  <Link to={`/studio/${studio._id}`}>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
                      View Details & Reviews
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookStudio;