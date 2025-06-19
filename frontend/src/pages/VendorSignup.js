// import React, { useState } from 'react';
// import { signupVendor } from '../services/api';
// import { useNavigate } from 'react-router-dom';

// export default function VendorSignup() {
//   const nav = useNavigate();
//   const [form, setForm] = useState({
//     name: '',
//     companyEmail: '',
//     contactPerson: '',      // maybe JSON or stringified
//     addresses: '',          // you can string‑split or JSON.parse
//     password: ''            // if you added password to vendor schema
//   });
//   const [error, setError] = useState('');

//   const handleChange = e => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const onSubmit = async e => {
//     e.preventDefault();
//     try {
//       // If addresses/contactPerson need parsing, do it here
//       const payload = {
//         ...form,
//         contactPerson: JSON.parse(form.contactPerson),
//         addresses: JSON.parse(form.addresses)
//       };
//       const res = await signupVendor(payload);
//       localStorage.setItem('token', res.data.token);
//       nav('/vendor/dashboard');
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
//         <h2 className="text-2xl font-semibold mb-6">Vendor Sign Up</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {[
//           { name: 'name',         label: 'Store Name' },
//           { name: 'companyEmail', label: 'Company Email' },
//           { name: 'password',     label: 'Password' },
//           { name: 'contactPerson',label: 'Contact Person (JSON)' },
//           { name: 'addresses',    label: 'Addresses (JSON array)' }
//         ].map(({ name, label }) => (
//           <div key={name} className="mb-4">
//             <label className="block mb-1">{label}</label>
//             <input
//               name={name}
//               type={name==='password'? 'password':'text'}
//               className="w-full border px-3 py-2 rounded"
//               value={form[name]}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         ))}
//         <button className="w-full bg-green-600 text-white py-2 rounded-lg">
//           Sign Up
//         </button>
//       </form>
//     </div>
//   );
// }
// frontend/src/pages/VendorSignup.js
import React, { useState } from 'react';
import { signupVendor } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function VendorSignup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    companyEmail: '',
    password: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    operationType: 'office',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      // build nested objects
      const payload = {
        name: form.name,
        companyEmail: form.companyEmail,
        password: form.password,
        contactPerson: {
          name: form.contactName,
          email: form.contactEmail,
          phone: form.contactPhone
        },
        addresses: [
          {
            operationType: form.operationType,
            street: form.street,
            city: form.city,
            state: form.state,
            country: form.country,
            postalCode: form.postalCode,
            phone: form.contactPhone
          }
        ]
      };
      const res = await signupVendor(payload);
      localStorage.setItem('token', res.data.token);
      nav('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-6">Vendor Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Store Name */}
        <div className="mb-4">
          <label htmlFor="name">Store Name</label>
          <input
            id="name" name="name" type="text" autoComplete="organization"
            value={form.name} onChange={handleChange} required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Company Email */}
        <div className="mb-4">
          <label htmlFor="companyEmail">Company Email</label>
          <input
            id="companyEmail" name="companyEmail" type="email" autoComplete="email"
            value={form.companyEmail} onChange={handleChange} required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            id="password" name="password" type="password" autoComplete="new-password"
            value={form.password} onChange={handleChange} required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Contact Person */}
        <h3 className="mt-6 mb-2 font-medium">Contact Person</h3>
        {['contactName','contactEmail','contactPhone'].map(field => (
          <div key={field} className="mb-4">
            <label htmlFor={field} className="capitalize">
              {field.replace('contact','').replace(/([A-Z])/g,' $1').trim()}
            </label>
            <input
              id={field} name={field}
              type={field==='contactEmail'?'email': 'text'}
              autoComplete={field==='contactPhone'?'tel':'name'}
              value={form[field]} onChange={handleChange} required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        ))}

        {/* Address */}
        <h3 className="mt-6 mb-2 font-medium">Primary Address</h3>
        <div className="mb-4">
          <label htmlFor="operationType">Operation Type</label>
          <select
            id="operationType" name="operationType"
            value={form.operationType} onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            {['warehouse','office','pickup','returns','other'].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {['street','city','state','country','postalCode'].map(field => (
          <div key={field} className="mb-4">
            <label htmlFor={field} className="capitalize">{field}</label>
            <input
              id={field} name={field} type="text"
              autoComplete={field==='postalCode'?'postal-code':'street-address'}
              value={form[field]} onChange={handleChange} required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        ))}

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg">
          Sign Up
        </button>
      </form>
    </div>
  );
}
