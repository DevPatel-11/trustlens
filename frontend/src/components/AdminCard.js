// src/components/AdminCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield } from 'react-icons/fa';

export default function AdminCard() {
  const nav = useNavigate();
  return (
    <div className="border-2 border-indigo-300 rounded-lg p-6 shadow-md flex-1 m-4">
      <div className="text-4xl mb-4"><FaUserShield /></div>
      <h2 className="text-2xl font-semibold mb-1">Admin Login</h2>
      <p className="text-gray-600 mb-6">
        Access the admin dashboard and analytics
      </p>
      <button
        className="w-full bg-indigo-600 text-white py-2 rounded-lg"
        onClick={() => nav('/admin/login')}
      >
        Login
      </button>
    </div>
  );
}
