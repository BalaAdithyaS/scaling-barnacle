import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Results from './pages/Results';
import './App.css';

// Global Axios configuration
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function App() {
  const [extractedData, setExtractedData] = useState(null);
  const [lastFileName, setLastFileName] = useState('');

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  useEffect(() => {
    const saved = localStorage.getItem('lastUpload');
    if (saved) {
      setLastFileName(JSON.parse(saved).name);
    }
  }, []);

  const handleSetExtractedData = (data) => {
    setExtractedData(data);
    const saved = JSON.parse(localStorage.getItem('lastUpload'));
    if (saved) setLastFileName(saved.name);
  };

  return (
    <Router>
      <div className="app-main">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload setExtractedData={handleSetExtractedData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results data={extractedData} lastFileName={lastFileName} />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
