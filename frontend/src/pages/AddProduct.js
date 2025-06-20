import React, { useState } from 'react';
import { createProduct } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    images: ['', '', '']
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm({ ...form, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(form);
      nav('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        {['name', 'description', 'price', 'category', 'quantity'].map((field) => (
          <div key={field} className="mb-4">
            <label className="block mb-1 capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        ))}
        <div className="mb-4">
          <label className="block mb-1">Image URLs</label>
          {form.images.map((img, i) => (
            <input
              key={i}
              type="text"
              value={img}
              onChange={(e) => handleImageChange(i, e.target.value)}
              className="w-full border px-3 py-2 mb-2 rounded"
              placeholder={`Image URL ${i + 1}`}
            />
          ))}
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
          Add Product
        </button>
      </form>
    </div>
  );
}
