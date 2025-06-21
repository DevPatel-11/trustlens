import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function CustomerProductInfo() {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return nav('/customer/login');

    const fetchData = async () => {
      try {
        const res = await apiService.getProductById(id);
        setProduct(res.data);

        const rev = await apiService.getReviewsByProduct(id);
        setReviews(rev.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id, nav]);

  const handleBuy = async () => {
    try {
      const res = await apiService.buyProduct(id);
      setProduct(res.data.product);
      alert('Product purchased!');
    } catch (err) {
      alert('Buy failed: ' + err.response?.data?.message || err.message);
    }
  };

  const handleReturn = async () => {
    try {
      const res = await apiService.returnProduct(id);
      setProduct(res.data.product);
      alert('Product returned!');
    } catch (err) {
      alert('Return failed: ' + err.response?.data?.message || err.message);
    }
  };

  const handleSubmitReview = async () => {
    try {
      const res = await apiService.createReview({
        product: id,
        rating,
        content: reviewContent,
      });
      setReviewContent('');
      setRating(5);
      const rev = await apiService.getReviewsByProduct(id);
      setReviews(rev.data);
      alert('Review submitted!');
    } catch (err) {
      alert('Review failed: ' + err.response?.data?.message || err.message);
    }
  };

  if (!product) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <img src={product.images?.[0]} alt={product.name} className="w-full max-h-96 object-cover rounded my-4" />
      <p className="mb-2 text-lg">₹{product.price}</p>
      <p className="mb-2">{product.description}</p>
      <p className="mb-2">Available Quantity: {product.quantity}</p>
      <p className="mb-2">Total Sold: {product.totalSold}</p>
      <p className="mb-2">Total Returned: {product.totalReturned}</p>
      <p className="mb-4">Return Rate: {product.returnRate?.toFixed(2)}%</p>

      <div className="flex gap-4 mb-6">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleBuy}>Buy</button>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded" onClick={handleReturn}>Return</button>
      </div>

      <hr className="my-4" />

      <h2 className="text-xl font-semibold mb-2">Write a Review</h2>
      <textarea
        value={reviewContent}
        onChange={(e) => setReviewContent(e.target.value)}
        placeholder="Your review..."
        className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
      />
      <input
        type="number"
        value={rating}
        min={1}
        max={5}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-20 mt-2 p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
      />
      <button onClick={handleSubmitReview} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">Submit Review</button>

      <hr className="my-4" />

      <h2 className="text-xl font-semibold mb-2">Customer Reviews</h2>
      {reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map((rev) => (
        <div key={rev._id} className="bg-gray-100 dark:bg-gray-800 p-4 my-2 rounded">
          <p className="font-medium">Rating: {rev.rating}/5</p>
          <p>{rev.content}</p>
        </div>
      ))}
    </div>
  );
}
