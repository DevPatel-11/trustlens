import React, { useState } from 'react';
import { loginVendor } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function VendorLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ companyEmail: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await loginVendor(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', 'vendor');
      localStorage.setItem('vendorId', res.data.vendor._id);
      nav('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Vendor Login</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
          <input
            name="companyEmail"
            type="email"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={form.companyEmail}
            onChange={handleChange}
            required
            placeholder="company@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            name="password"
            type="password"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition duration-200"
        >
          {loading ? 'Signing In...' : 'Login'}
        </button>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <a href="/vendor/signup" className="text-green-600 hover:text-green-700 font-medium">
            Register here
          </a>
        </p>
      </form>
    </div>
  );
}
