import React from 'react';
import AuthCard from '../components/AuthCard';
import { FaShoppingCart, FaStore } from 'react-icons/fa';

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-2">Welcome to TrustLens</h1>
      <p className="text-gray-700 mb-8">Choose how you want to get started</p>
      <div className="flex flex-wrap justify-center max-w-4xl">
        <AuthCard
          title="Shop as Customer"
          subtitle="Browse and purchase products from various vendors"
          onSignUp="/customer/signup"
          onLogin="/customer/login"
          icon={<FaShoppingCart />}
          borderColor="border-blue-300"
        />
        <AuthCard
          title="Sell as Vendor"
          subtitle="List your products and manage your online store"
          onSignUp="/vendor/signup"
          onLogin="/vendor/login"
          icon={<FaStore />}
          borderColor="border-green-300"
        />
      </div>
      <p className="mt-8 text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/admin/login" className="text-blue-600">Admin Login</a>
      </p>
    </div>
  );
}
