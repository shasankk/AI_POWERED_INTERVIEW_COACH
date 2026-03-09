import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Setup from './pages/Setup';
import Interview from './pages/Interview';
import Home from './pages/Home';
import Results from './pages/Results';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FAQ from './pages/FAQ';
import HowItWorks from './pages/HowItWorks';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Standalone informative pages */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        {/* Protected Standalone Dashboard Pages */}
        <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
