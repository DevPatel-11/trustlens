import React, { useState } from 'react';
import { signupVendor } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function VendorSignup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    companyEmail: '',
    contactPerson: '',      // maybe JSON or stringified
    addresses: '',          // you can string‑split or JSON.parse
    password: ''            // if you added password to vendor schema
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      // If addresses/contactPerson need parsing, do it here
      const payload = {
        ...form,
        contactPerson: JSON.parse(form.contactPerson),
        addresses: JSON.parse(form.addresses)
      };
      const res = await signupVendor(payload);
      localStorage.setItem('token', res.data.token);
      nav('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow"
      >
        <h2 className="text-2xl font-semibold mb-6">Vendor Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {[
          { name: 'name',         label: 'Store Name' },
          { name: 'companyEmail', label: 'Company Email' },
          { name: 'password',     label: 'Password' },
          { name: 'contactPerson',label: 'Contact Person (JSON)' },
          { name: 'addresses',    label: 'Addresses (JSON array)' }
        ].map(({ name, label }) => (
          <div key={name} className="mb-4">
            <label className="block mb-1">{label}</label>
            <input
              name={name}
              type={name==='password'? 'password':'text'}
              className="w-full border px-3 py-2 rounded"
              value={form[name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button className="w-full bg-green-600 text-white py-2 rounded-lg">
          Sign Up
        </button>
      </form>
    </div>
  );
}
