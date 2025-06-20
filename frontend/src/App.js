// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext';
//import Navigation      from './components/Navigation';
import Welcome         from './pages/Welcome';
import CustomerSignup  from './pages/CustomerSignup';
import CustomerLogin   from './pages/CustomerLogin';
import VendorSignup    from './pages/VendorSignup';
import VendorLogin     from './pages/VendorLogin';

import AdminLogin      from './pages/AdminLogin';
import AdminDashboard  from './pages/AdminDashboard';
import AddProduct from './pages/AddProduct';
import VendorDashboard from './pages/VendorDashboard';
import ProductDetail   from './pages/ProductDetail';
import EditProduct from './pages/EditProduct';
import CustomerDashboard from './pages/CustomerDashboard';
function App() {
  return (
    <ThemeProvider>
      <Router>
 

        <div className="App min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<Welcome />} />

            {/* Customer / Vendor flows */}
            <Route path="/customer/signup" element={<CustomerSignup />} />
            <Route path="/customer/login"  element={<CustomerLogin />} />
            <Route path="/vendor/signup"   element={<VendorSignup />} />
            <Route path="/vendor/login"    element={<VendorLogin />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            {/* Admin */}
            <Route path="/admin/login"     element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/vendor/add-product" element={<AddProduct />} />
            <Route path="/vendor/products/:prodId/edit" element={<EditProduct />} />
            
            
            <Route path="/vendor/dashboard"        element={<VendorDashboard />} />
            <Route path="/vendor/products/:prodId" element={<ProductDetail />} />
            {/* 404 */}
            <Route path="*" element={<div className="p-8">404- Not found</div>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
