import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookStudio from './pages/BookStudio';
import StudioDetail from './pages/StudioDetail'; // Keep this if you have the file

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page - shows the studio list */}
        <Route path="/" element={<BookStudio />} />
        
        {/* Optional: same as home */}
        <Route path="/book-studio" element={<BookStudio />} />
        
        {/* Detail page for individual studios */}
        <Route path="/studio/:id" element={<StudioDetail />} />
      </Routes>
    </Router>
  );
}

export default App;