// frontend/src/pages/AdminLogin.js
import React, { useState } from 'react';
import { loginAdmin } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await loginAdmin(form);
      localStorage.setItem('adminToken', res.data.token);
      nav('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {['username','password'].map(field => (
          <div key={field} className="mb-4">
            <label className="block mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              name={field}
              type={field==='password'?'password':'text'}
              value={form[field]}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        ))}
        <button className="w-full bg-indigo-600 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
