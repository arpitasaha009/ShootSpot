import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookStudio from './pages/BookStudio';
import StudioDetail from './pages/StudioDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Routes>

          <Route path="/" element={<BookStudio />} />
          <Route path="/book-studio" element={<BookStudio />} />
          <Route path="/studio/:id" element={<StudioDetail />} />
          {/* You can add more pages later */}
        </Routes>
      </Routes>
    </Router>
  );c
}

export default App;