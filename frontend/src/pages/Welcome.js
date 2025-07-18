import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaShoppingCart, FaStore } from 'react-icons/fa';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <img 
              src="/TrustLensLogo.jpeg" 
              alt="TrustLens Logo" 
              className="h-20 w-20 rounded-full shadow-lg mr-4"
            />
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                TRUSTLENS
              </h1>
              <p className="text-xl text-blue-600 dark:text-blue-400 font-medium">
                AI-Powered Trust System 
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the future of e-commerce with advanced AI fraud detection, 
            behavioral analysis, and community-driven trust verification.
          </p>
        </div>

        {/* Login Options */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Choose Your Access Level
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Admin Login */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-red-500">
              <div className="bg-red-100 dark:bg-red-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-3xl text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Admin Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Complete system oversight with advanced analytics, fraud detection, 
                and platform management capabilities.
              </p>
              <button
                onClick={() => navigate('/admin/login')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Admin Login
              </button>
            </div>

            {/* Customer Login */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-500">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FaShoppingCart className="text-3xl text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Customer Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Shop with confidence using AI-verified products and 
                community-validated reviews for trusted purchases.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/customer/login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Customer Login
                </button>
                <button
                  onClick={() => navigate('/customer/signup')}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Sign Up as Customer
                </button>
              </div>
            </div>

            {/* Vendor Login */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-500">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FaStore className="text-3xl text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Vendor Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Manage your store with AI-powered insights, fraud alerts, 
                and comprehensive analytics for business growth.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/vendor/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Vendor Login
                </button>
                <button
                  onClick={() => navigate('/vendor/signup')}
                  className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Sign Up as Vendor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* Removed advanced AI features section */}
      </div>
    </div>
  );
}
