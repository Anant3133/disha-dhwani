// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; 
import './index.css'; 
import AdminHome from './pages/AdminHome'; 
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="h-screen bg-gray-100">
        {/* You can add a navbar or header here if you want */}
        <Routes>
          <Route path="/adminhome" element={<AdminHome />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          {/* Add your routes here */}
          {/* Example route: <Route path="/" element={<Home />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
