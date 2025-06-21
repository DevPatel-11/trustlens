import React, { useState } from 'react';
import axios from 'axios';

const ReviewForm = ({ productId, customerId, onSuccess }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
        content,
        rating,
        product: productId,
        reviewer: customerId
      });
      setContent('');
      setRating(5);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      console.error('Review submission failed:', err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your review"
        required
      ></textarea>
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>{num} Stars</option>
        ))}
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;