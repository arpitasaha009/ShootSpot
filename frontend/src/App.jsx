import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import BookStudio from './pages/BookStudio';
import BookStudioDetail from './pages/BookStudioDetail';
import BookingConfirmation from './pages/BookingConfirmation';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Studio Browsing & Booking Routes */}
        <Route path="/book-studio" element={<BookStudio />} />
        <Route path="/book-studio/:studioId" element={<BookStudioDetail />} />
        
        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/booking-confirmation/:bookingId"
          element={
            <PrivateRoute>
              <BookingConfirmation />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;