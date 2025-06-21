// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';

// Pages
import Welcome from './pages/Welcome';
import CustomerSignup from './pages/CustomerSignup';
import CustomerLogin from './pages/CustomerLogin';
import VendorSignup from './pages/VendorSignup';
import VendorLogin from './pages/VendorLogin';
import AdminLogin from './pages/AdminLogin';

// Admin Components
import AdminDashboard from './components/AdminDashboard';

// Component to conditionally render Navigation
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Only render Navigation for non-admin routes */}
      {!isAdminRoute && <Navigation />}

      {/* Route Content */}
      <Routes>
        {/* Welcome / landing */}
        <Route path="/" element={<Welcome />} />

        {/* Customer flows */}
        <Route path="/customer/signup" element={<CustomerSignup />} />
        <Route path="/customer/login" element={<CustomerLogin />} />

        {/* Vendor flows */}
        <Route path="/vendor/signup" element={<VendorSignup />} />
        <Route path="/vendor/login" element={<VendorLogin />} />

        {/* Admin flows */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Fallback 404 */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">The page you're looking for doesn't exist.</div>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <div className="App min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Router>
          <AppContent />
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
