import React, { useState, useEffect } from 'react';
import { getProductDetail } from '../services/api';
import { useParams, Navigate } from 'react-router-dom';

export default function ProductDetail() {
  const { prodId } = useParams();
  const [detail, setDetail] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthenticated(false);
    } else {
      getProductDetail(prodId)
        .then(res => setDetail(res.data))
        .catch(console.error);
    }
    setCheckedAuth(true);
  }, [prodId]);

  if (!checkedAuth) return null; // Wait until auth check completes

  if (!authenticated) return <Navigate to="/vendor/login" replace />;

  if (!detail) return <div>Loading product…</div>;

  const { product, stats, reviews, avgTrustScore } = detail;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <p className="mb-4">{product.description}</p>
      
{product.images && product.images.length > 0 && (
  <div className="flex gap-4 mb-4">
    {product.images.map((url, idx) => (
      <img
        key={idx}
        src={url}
        alt={`Product image ${idx + 1}`}
        className="w-40 h-40 object-cover rounded shadow"
      />
    ))}
  </div>
)}

      <div className="mb-4">
        <span>Purchased: {stats.purchases}</span>
        <span className="mx-4">Returned: {stats.returns}</span>
        <span>Return Rate: {stats.returnRate.toFixed(1)}%</span>
      </div>
      <div className="mb-4">
        <strong>Avg. Review Trust Score:</strong> {avgTrustScore.toFixed(1)}%
      </div>
      <section>
        <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
        {reviews.length
          ? reviews.map((r, i) => (
              <div key={i} className="border-b py-2">
                <p>{r.text}</p>
                <small>{new Date(r.createdAt).toLocaleDateString()}</small>
              </div>
            ))
          : <p>No reviews yet.</p>
        }
      </section>
    </div>
  );
}
