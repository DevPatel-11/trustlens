import React, { useState } from 'react';
import { signupCustomer } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerSignup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    mobileNumber: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await signupCustomer(form);
      localStorage.setItem('token', res.data.token);
      nav('/customer/dashboard'); // or wherever
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow"
      >
        <h2 className="text-2xl font-semibold mb-6">Customer Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {['username','email','mobileNumber','password'].map(field => (
          <div key={field} className="mb-4">
            <label className="block mb-1 capitalize">{field}</label>
            <input
              name={field}
              type={field === 'password' ? 'password' : 'text'}
              className="w-full border px-3 py-2 rounded"
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
          Sign Up
        </button>
      </form>
    </div>
  );
}
// import React, { useState } from 'react';
// import { signupCustomer } from '../services/api';
// import { useNavigate } from 'react-router-dom';

// export default function CustomerSignup() {
//   const nav = useNavigate();
//   const [form, setForm] = useState({
//     username: '',
//     email: '',
//     mobileNumber: '',
//     password: ''
//   });
//   const [error, setError] = useState('');

//   const handleChange = e => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const onSubmit = async e => {
//     e.preventDefault();
//     try {
//       const res = await signupCustomer(form);
//       localStorage.setItem('token', res.data.token);
//       nav('/customer/dashboard'); // or wherever
//     } catch (err) {
//       setError(err.response?.data?.error || 'Signup failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//       <form
//         onSubmit={onSubmit}
//         className="w-full max-w-md bg-white p-8 rounded-lg shadow"
//       >
//         <h2 className="text-2xl font-semibold mb-6">Customer Sign Up</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {['username','email','mobileNumber','password'].map(field => (
//           <div key={field} className="mb-4">
//             <label className="block mb-1 capitalize">{field}</label>
//             <input
//               name={field}
//               type={field === 'password' ? 'password' : 'text'}
//               className="w-full border px-3 py-2 rounded"
//               value={form[field]}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         ))}
//         <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
//           Sign Up
//         </button>
//       </form>
//     </div>
//   );
// }
// import React, { useState } from 'react';
// import { signupCustomer } from '../services/api';
// import { useNavigate } from 'react-router-dom';

// export default function CustomerSignup() {
//   const nav = useNavigate();
//   const [form, setForm] = useState({
//     username: '',
//     email: '',
//     mobileNumber: '',
//     password: ''
//   });
//   const [error, setError] = useState('');

//   const handleChange = e => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const onSubmit = async e => {
//     e.preventDefault();
//     try {
//       const res = await signupCustomer(form);
//       localStorage.setItem('token', res.data.token);
//       nav('/customer/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Signup failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//       <form
//         onSubmit={onSubmit}
//         className="w-full max-w-md bg-white p-8 rounded-lg shadow"
//       >
//         <h2 className="text-2xl font-semibold mb-6">Customer Sign Up</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}

//         {/* Username */}
//         <div className="mb-4">
//           <label htmlFor="username" className="block mb-1">
//             Username
//           </label>
//           <input
//             id="username"
//             name="username"
//             type="text"
//             autoComplete="username"
//             className="w-full border px-3 py-2 rounded"
//             value={form.username}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         {/* Email */}
//         <div className="mb-4">
//           <label htmlFor="email" className="block mb-1">
//             Email
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             autoComplete="email"
//             className="w-full border px-3 py-2 rounded"
//             value={form.email}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         {/* Mobile Number */}
//         <div className="mb-4">
//           <label htmlFor="mobileNumber" className="block mb-1">
//             Mobile Number
//           </label>
//           <input
//             id="mobileNumber"
//             name="mobileNumber"
//             type="tel"
//             autoComplete="tel"
//             className="w-full border px-3 py-2 rounded"
//             value={form.mobileNumber}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         {/* Password */}
//         <div className="mb-4">
//           <label htmlFor="password" className="block mb-1">
//             Password
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             autoComplete="new-password"
//             className="w-full border px-3 py-2 rounded"
//             value={form.password}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded-lg"
//         >
//           Sign Up
//         </button>
//       </form>
//     </div>
//   );
// }
