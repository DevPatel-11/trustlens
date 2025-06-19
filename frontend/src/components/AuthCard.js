import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCard({
  title,
  subtitle,
  onSignUp,
  onLogin,
  icon,
  borderColor = 'border-gray-300'
}) {
  const nav = useNavigate();
  return (
    <div className={`border-2 ${borderColor} rounded-lg p-6 shadow-md flex-1 m-4`}>
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-2xl font-semibold mb-1">{title}</h2>
      <p className="text-gray-600 mb-6">{subtitle}</p>
      <button
        className="w-full bg-blue-600 text-white py-2 rounded-lg mb-2"
        onClick={() => nav(onSignUp)}
      >
        Sign Up
      </button>
      <button
        className="w-full border border-gray-300 py-2 rounded-lg"
        onClick={() => nav(onLogin)}
      >
        Login
      </button>
    </div>
  );
}
