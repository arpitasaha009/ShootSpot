import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';

const BookStudio = () => {
  const navigate = useNavigate();
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states for the requirement
  const [studioType, setStudioType] = useState('all');
  const [location, setLocation] = useState('');
  const [setupType, setSetupType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        setLoading(true);
        
        // Build query params with all filters
        const params = {};
        if (studioType !== 'all') params.type = studioType;
        if (location.trim() !== '') params.location = location;
        if (setupType !== 'all') params.setup = setupType;
        
        const response = await api.get('/studios', { params });
        setStudios(response.data.studios || []);
        console.log('Fetched studios:', response.data.studios);
        setError(null);
      } catch (err) {
        setError('Failed to fetch studios. Please try again later.');
        console.error('Error fetching studios:', err);
        setStudios([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStudios();
  }, [studioType, location, setupType]);
  
  const handleStudioSelect = (studioId) => {