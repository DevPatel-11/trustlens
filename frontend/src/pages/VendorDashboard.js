// import React, { useState, useEffect } from 'react';
// import { getVendorProfile, getVendorProducts } from '../services/api';
// import { Link, navigate} from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

// export default function VendorDashboard() {
//   const [vendor, setVendor]     = useState(null);
//   const [products, setProducts] = useState([]);
//   const [checkedAuth, setCheckedAuth] = useState(false);
//   const [authenticated, setAuthenticated] = useState(true);
  

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       setAuthenticated(false);
//       setCheckedAuth(true);
//       return;
//     }

//     async function fetchData() {
//       try {
//         const [{ data: v }, { data: ps }] = await Promise.all([
//           getVendorProfile(),
//           getVendorProducts()
//         ]);
//         setVendor(v);
//         setProducts(ps);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setCheckedAuth(true);
//       }
//     }

//     fetchData();
//   }, []);

//   if (!checkedAuth) return null;
//   if (!authenticated) return <Navigate to="/vendor/login" replace />;
//   if (!vendor) return <div>Loading profile…</div>;

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Hello, {vendor.name}</h1>

//       <section className="mb-8">
//         <h2 className="text-2xl font-semibold">Your Profile</h2>
//         <ul className="list-disc pl-4">
//           <li>Email: {vendor.companyEmail}</li>
//           <li>Contact: {vendor.contactPerson.name} ({vendor.contactPerson.phone})</li>
//           <li>
//             Addresses: {vendor.addresses.map(a => `${a.street}, ${a.city}`).join(' | ')}
//           </li>
//         </ul>
//       </section>

//       <section>
//         <h2 className="text-2xl font-semibold mb-2">Your Products</h2>
//         <div className="grid md:grid-cols-2 gap-4">
//           {products.map(p => (
//             <Link
//               key={p._id}
//               to={`/vendor/products/${p._id}`}
//               className="border p-4 rounded hover:shadow"
//             >
//               <h3 className="text-xl font-medium">{p.name}</h3>
//               <p className="text-gray-600">${p.price}</p>
//             </Link>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }
// frontend/src/pages/VendorDashboard.js

import React, { useState, useEffect } from 'react';
import { getVendorProfile, getVendorProducts } from '../services/api';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { deleteProduct } from '../services/api';

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthenticated(false);
      setCheckedAuth(true);
      return;
    }

    async function fetchData() {
      try {
        const [{ data: v }, { data: ps }] = await Promise.all([
          getVendorProfile(),
          getVendorProducts()
        ]);
        setVendor(v);
        setProducts(ps);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckedAuth(true);
      }
    }

    fetchData();
  }, []);

  const handleDelete = async (productId) => {
  if (window.confirm('Are you sure you want to delete this product?')) {
    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  }
};

  if (!checkedAuth) return null;
  if (!authenticated) return <Navigate to="/vendor/login" replace />;
  if (!vendor) return <div>Loading profile…</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome {vendor.name}!</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold">Your Profile</h2>
        <ul className="list-disc pl-4">
          <li>Email: {vendor.companyEmail}</li>
          <li>Contact: {vendor.contactPerson.name} ({vendor.contactPerson.phone})</li>
          <li>
            Addresses: {vendor.addresses.map(a => `${a.street}, ${a.city}`).join(' | ')}
          </li>
        </ul>
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold">Your Products</h2>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => navigate('/vendor/add-product')}
          >
            + Add New Product
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p._id} className="border p-4 rounded hover:shadow flex flex-col justify-between">
  <Link to={`/vendor/products/${p._id}`}>
    <h3 className="text-xl font-medium">{p.name}</h3>
    <p className="text-gray-600">${p.price}</p>
  </Link>
  <button
    className="mt-2 text-sm text-red-600 hover:underline self-start"
    onClick={() => handleDelete(p._id)}
  >
    Remove Product
  </button>
</div>

          ))}
        </div>
      </section>
    </div>
  );
}
