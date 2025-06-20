import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      nav('/customer/login');
      return;
    }

    const fetchData = async () => {
      try {
        const resUser = await apiService.getCustomerDetails();
        setCustomer(resUser.data);
        const resProducts = await apiService.getProducts();
        setProducts(resProducts.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [nav]);

  if (!customer) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hello, {customer.username}</h1>
            <p className="text-gray-600 dark:text-gray-300">{customer.email}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Your Trust Score</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{customer.trustScore}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(prod => (
            <div
              key={prod._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => nav(`/customer/${prod._id}`)}
            >
              <img
                src={prod.images?.[0]}
                alt={prod.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{prod.name}</h3>
                <p className="text-gray-700 dark:text-gray-300">₹{prod.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
