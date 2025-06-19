// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext';
import Navigation      from './components/Navigation';

// <-- your new pages -->
import Welcome          from './pages/Welcome';
import CustomerSignup   from './pages/CustomerSignup';
import CustomerLogin    from './pages/CustomerLogin';
import VendorSignup     from './pages/VendorSignup';
import VendorLogin      from './pages/VendorLogin';

function App() {
  return (
    <ThemeProvider>
      <div className="App min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Router>
          {/* your top-level nav (if you want it on every page) */}
          <Navigation />

          {/* the page content */}
          <Routes>
            {/* Welcome / landing */}
            <Route path="/" element={<Welcome />} />

            {/* Customer flows */}
            <Route path="/customer/signup" element={<CustomerSignup />} />
            <Route path="/customer/login"  element={<CustomerLogin />} />

            {/* Vendor flows */}
            <Route path="/vendor/signup"  element={<VendorSignup />} />
            <Route path="/vendor/login"   element={<VendorLogin />} />

            {/* add your protected dashboards here */}
            {/* <Route path="/customer/dashboard" element={<Dashboard />} /> */}

            {/* fallback 404 */}
            <Route path="*" element={<div className="p-8">404: Page not found</div>} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
