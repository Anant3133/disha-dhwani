// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; 
import './index.css'; 
import AdminHome from './pages/AdminHome'; 
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import MenteeDashboard from './pages/MenteeDashboard';

function App() {
  return (
    <Router>
      <div className="h-screen bg-gray-100">
        {/* You can add a navbar or header here if you want */}
        <Routes>
          <Route path="/adminhome" element={<AdminHome />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/" element={<AuthPage />} />
          <Route path="menteedashboard" element={<MenteeDashboard />} />
          {/* Add your routes here */}
          {/* Example route: <Route path="/" element={<Home />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
