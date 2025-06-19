import React, { useState } from 'react';
import { loginCustomer } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await loginCustomer(form);
      localStorage.setItem('token', res.data.token);
      nav('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow"
      >
        <h2 className="text-2xl font-semibold mb-6">Customer Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {['email','password'].map(field => (
          <div key={field} className="mb-4">
            <label className="block mb-1 capitalize">{field}</label>
            <input
              name={field}
              type={field === 'password' ? 'password' : 'text'}
              className="w-full border px-3 py-2 rounded"
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
          Login
        </button>
      </form>
    </div>
  );
}
