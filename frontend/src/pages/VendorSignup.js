import React, { useState } from 'react';
import { signupVendor } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function VendorSignup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    companyEmail: '',
    password: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    addressPhone: ''
  });
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
      // Format the data as expected by the backend
      const payload = {
        name: form.name,
        companyEmail: form.companyEmail,
        password: form.password,
        contactPerson: {
          name: form.contactName,
          email: form.contactEmail,
          phone: form.contactPhone
        },
        addresses: [{
          operationType: 'office',
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
          postalCode: form.postalCode,
          phone: form.addressPhone
        }]
      };
      
      const res = await signupVendor(payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', 'vendor');
      localStorage.setItem('vendorId', res.data.vendor._id);
      nav('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Vendor Registration</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Company Information</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
            <input
              name="name"
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your Store Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Email *</label>
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              name="password"
              type="password"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter secure password"
            />
          </div>

          {/* Contact Person */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 mt-6">Contact Person</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
            <input
              name="contactName"
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.contactName}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
            <input
              name="contactEmail"
              type="email"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.contactEmail}
              onChange={handleChange}
              required
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
            <input
              name="contactPhone"
              type="tel"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.contactPhone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Business Address */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 mt-6">Business Address</h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
            <input
              name="street"
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.street}
              onChange={handleChange}
              required
              placeholder="123 Business Street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <input
              name="city"
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.city}
              onChange={handleChange}
              required
              placeholder="New York"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
            <input
              name="state"
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.state}
              onChange={handleChange}
              required
              placeholder="NY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
            <input
              name="country"
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.country}
              onChange={handleChange}
              required
              placeholder="United States"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
            <input
              name="postalCode"
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.postalCode}
              onChange={handleChange}
              placeholder="10001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone *</label>
            <input
              name="addressPhone"
              type="tel"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.addressPhone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 987-6543"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition duration-200"
        >
          {loading ? 'Creating Account...' : 'Register as Vendor'}
        </button>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <a href="/vendor/login" className="text-green-600 hover:text-green-700 font-medium">
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}
