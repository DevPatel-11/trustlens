// import React, { useState, useEffect } from 'react';
// import { getProductById, updateProduct } from '../services/api';
// import { useNavigate, useParams } from 'react-router-dom';

// export default function EditProduct() {
//   const { prodId } = useParams();
//   const nav = useNavigate();
//   const [form, setForm] = useState({
//     name: '',
//     description: '',
//     price: '',
//     category: '',
//     quantity: '',
//     images: []
//   });
//   const [error, setError] = useState('');

//   useEffect(() => {
//     async function fetchProduct() {
//       try {
//         const { data } = await getProductById(prodId);
//         setForm({
//           ...data,
//           images: Array.isArray(data.images) ? data.images : []
//         });
//       } catch (err) {
//         setError('Failed to load product');
//       }
//     }
//     fetchProduct();
//   }, [prodId]);

//   const handleChange = e => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (index, value) => {
//     const newImages = [...form.images];
//     newImages[index] = value;
//     setForm({ ...form, images: newImages });
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       await updateProduct(prodId, form);
//       nav('/vendor/dashboard');
//     } catch (err) {
//       setError('Failed to update product');
//     }
//   };

//   return (
//     <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
//       <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       <form onSubmit={handleSubmit}>
//         {['name', 'description', 'price', 'category', 'quantity'].map(field => (
//           <div key={field} className="mb-4">
//             <label className="block mb-1 capitalize">{field}</label>
//             <input
//               type="text"
//               name={field}
//               value={form[field]}
//               onChange={handleChange}
//               className="w-full border px-3 py-2 rounded"
//               required
//             />
//           </div>
//         ))}
//         <div className="mb-4">
//           <label className="block mb-1">Image URLs</label>
//           {form.images.map((img, i) => (
//             <input
//               key={i}
//               type="text"
//               value={img}
//               onChange={e => handleImageChange(i, e.target.value)}
//               className="w-full border px-3 py-2 mb-2 rounded"
//               placeholder={`Image URL ${i + 1}`}
//             />
//           ))}
//         </div>
//         <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
//           Update Product
//         </button>
//       </form>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function EditProduct() {
  const { prodId } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    images: ['']
  });

  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await apiService.getProductById(prodId);
        setForm({
          name: data.name || '',
          description: data.description || '',
          price: data.price || '',
          category: data.category || '',
          quantity: data.quantity || '',
          images: data.images && data.images.length > 0 ? data.images : ['']
        });
      } catch (err) {
        setError('Failed to load product details');
      }
    }

    fetchProduct();
  }, [prodId]);

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
      await apiService.updateProduct(prodId, form);

      nav('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Product
        </button>
      </form>
    </div>
  );
}
