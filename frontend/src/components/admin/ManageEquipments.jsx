import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaSearch, FaEdit, FaTrash, FaCalendarAlt, FaPlus, FaTimes, FaExclamationTriangle, FaPhotoVideo } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Modal from '../ui/Modal';

const ManageEquipments = () => {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'camera',
    description: '',
    brand: '',
    condition: 'good',
    dailyRate: '',
    images: []
  });
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchEquipments();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEquipments([]);
    } else {
      const filtered = equipments.filter(
        equipment => 
          equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equipment.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equipment.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipments(filtered);
    }
  }, [searchTerm, equipments]);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/r/equipments');
      setEquipments(response.data.equipments);
      setLoading(false);
    } catch (err) {
      setError('Failed to load equipments. Please try again later.');
      setLoading(false);
      console.error('Error fetching equipments:', err);
      toast.error('Failed to load equipments');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      images: e.target.files
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append images
      if (formData.images) {
        for (let i = 0; i < formData.images.length; i++) {
          formDataToSend.append('images', formData.images[i]);
        }
      }
      
      if (selectedEquipment) {
        // Update existing equipment
        await api.put(`/r/equipments/${selectedEquipment._id}`, formDataToSend);
        toast.success('Equipment updated successfully');
      } else {
        // Create new equipment
        await api.post('/r/equipments', formDataToSend);
        toast.success('Equipment added successfully');
      }
      
      // Reset form and fetch updated list
      setFormData({
        name: '',
        type: 'Camera Equipment',
        description: '',
        brand: '',
        condition: 'good',
        dailyRate: '',
        images: [],
      });
      setSelectedEquipment(null);
      setShowAddForm(false);
      fetchEquipments();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save equipment. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to save equipment');
      console.error('Error saving equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      name: equipment.name,
      type: equipment.type,
      description: equipment.description,
      brand: equipment.brand,
      condition: equipment.condition,
      dailyRate: equipment.dailyRate,
      images: []
    });
    setShowAddForm(true);
  };

  const openDeleteModal = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEquipment) return;
    
    try {
      setLoading(true);
      await api.delete(`/r/equipments/${selectedEquipment._id}`);
      toast.success('Equipment deleted successfully');
      setShowDeleteModal(false);
      setSelectedEquipment(null);
      fetchEquipments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete equipment. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to delete equipment');
      console.error('Error deleting equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRentals = (equipmentId) => {
    navigate(`/admin/equipments/${equipmentId}/rentals`);
  };

  const getStatusBadge = (isAvailable) => {
    return isAvailable ? 
      <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Available</span> :
      <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">Unavailable</span>;
  };

  const displayEquipments = searchTerm.trim() !== '' ? (filteredEquipments || []) : (equipments || []);
  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Equipment Management</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search equipments..."
                className="bg-black/50 border border-white/20 rounded-lg px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-white/50" />
            </div>
            <button
              onClick={() => {
                setSelectedEquipment(null);
                setFormData({
                  name: '',
                  type: 'Camera Equipment',
                  description: '',
                  brand: '',
                  condition: 'good',
                  dailyRate: '',
                  images: []
                });
                setShowAddForm(!showAddForm);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              {showAddForm ? <><FaTimes className="mr-2" /> Cancel</> : <><FaPlus className="mr-2" /> Add Equipment</>}
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-800/30 border border-red-700 p-4 rounded-lg mb-6 text-red-200">
            <p>{error}</p>
          </div>
        )}
        
        {showAddForm && (
          <div className="bg-black/30 border border-white/10 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">
              {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Equipment Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Camera Equipment">Camera Equipment</option>
                    <option value="Lenses">Lenses</option>
                    <option value="Lighting Equipment">Lighting Equipment</option>
                    <option value="Light Modifiers">Light Modifiers</option>
                    <option value="Camera Support">Camera Support</option>
                    <option value="Background & Backdrops">Background & Backdrops</option>
                    <option value="Power & Accessories">Power & Accessories</option>
                    <option value="Audio Accessories">Audio Accessories</option>
                    <option value="Studio Furniture">Studio Furniture</option>
                    <option value="Props & Styling">Props & Styling</option>
                    <option value="Storage & Maintenance">Storage & Maintenance</option>

                  </select>
                </div>
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Daily Rate ($)</label>
                  <input
                    type="number"
                    name="dailyRate"
                    value={formData.dailyRate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-white/70 mb-2 text-sm">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32"
                  required
                ></textarea>
              </div>
              
              {/* <div className="mb-6">
                <label className="block text-white/70 mb-2 text-sm">Images</label>
                <input
                  type="file"
                  name="images"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-white/50 text-xs mt-1">
                  {selectedEquipment ? 'Upload new images to add to existing ones' : 'You can select multiple images'}
                </p>
              </div> */}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (selectedEquipment ? 'Update Equipment' : 'Add Equipment')}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {loading && !showAddForm ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {displayEquipments.length === 0 ? (
              <div className="bg-black/30 border border-white/10 p-8 rounded-lg text-center">
                 <div className="text-6xl mb-4"><FaPhotoVideo size={64} className="text-white" /></div>
                <h2 className="text-xl font-bold mb-4">No Equipments Available</h2>
                <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                  {searchTerm ? "No equipments match your search" : "There are currently no equipments in the system. Add your first equipment using the button above."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Daily Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {displayEquipments.map((equipment) => (
                      <tr key={equipment._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{equipment.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{equipment.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{equipment.brand}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{equipment.condition}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">${equipment.dailyRate}/day</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(equipment.isAvailable)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(equipment)}
                              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                              title="Edit equipment"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => openDeleteModal(equipment)}
                              className="text-red-400 hover:text-red-300 transition-colors flex items-center"
                              title="Delete equipment"
                            >
                              <FaTrash />
                            </button>
                            {/* <button
                              onClick={() => handleViewRentals(equipment._id)}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center"
                              title="View rentals"
                            >
                              <FaCalendarAlt />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Equipment"
      >
        <div className="p-4">
          <div className="flex items-center text-amber-500 mb-4">
            <FaExclamationTriangle className="mr-2" />
            <p>Are you sure you want to delete this equipment?</p>
          </div>
          
          {selectedEquipment && (
            <div className="mb-4 p-3 bg-black/30 rounded-lg">
              <p><span className="text-white/50">Name:</span> {selectedEquipment.name}</p>
              <p><span className="text-white/50">Brand:</span> {selectedEquipment.brand}</p>
              <p><span className="text-white/50">Type:</span> {selectedEquipment.type}</p>
            </div>
          )}
          
          <p className="text-white/70 text-sm mb-4">
            This action cannot be undone. All rental records will remain in the system, but the equipment will no longer be available.
          </p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-transparent border border-white/20 rounded-lg hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageEquipments;
