import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Dashboard from './Dashboard';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const adminToken = localStorage.getItem('adminAuth');
      if (adminToken) {
        const adminData = JSON.parse(adminToken);
        if (adminData.email === 'admin@trustlens.com' && adminData.loginTime) {
          // Check if login is less than 24 hours old
          const loginTime = new Date(adminData.loginTime);
          const now = new Date();
          const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('adminAuth');
            setIsAuthenticated(false);
          }
        }
      }
    } catch (e) {
      localStorage.removeItem('adminAuth');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-900 dark:text-white">Verifying Admin Access...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mr-2">🛡️</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">TRUSTLENS Admin</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Secure Administration Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, Admin
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="flex">
        {/* Admin Navigation - Hidden for now, will be navigation tabs */}
        <div className="hidden">
          <Navigation />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {location.pathname === '/admin/dashboard' ? (
            <Dashboard />
          ) : (
            // Placeholder for other admin routes
            <div className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Feature Coming Soon</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">This admin section is under development.</p>
                <button
                  onClick={() => window.location.href = '/admin/dashboard'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 