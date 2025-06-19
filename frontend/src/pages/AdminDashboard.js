// frontend/src/pages/AdminDashboard.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

// All your admin‑side components live under src/components:
// import Dashboard           from '../components/Dashboard';
// import AlertSystem         from '../components/AlertSystem';
// import CommunityValidation from '../components/CommunityValidation';
// import EnhancedReviewAuth  from '../components/EnhancedReviewAuth';
// import MarketplaceSimulator from '../components/MarketplaceSimulator';
// import PredictionMarket    from '../components/PredictionMarket';
// import ProductTracker      from '../components/ProductTracker';
// import TrustDNAProfiler    from '../components/TrustDNAProfiler';

export default function AdminDashboard() {
  // Simple client‑side guard:
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin/login" />;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navigation />
      <main className="p-6 grid gap-6 md:grid-cols-2">
        {/* <Dashboard />
        <AlertSystem />
        <CommunityValidation />
        <EnhancedReviewAuth />
        <MarketplaceSimulator />
        <PredictionMarket />
        <ProductTracker />
        <TrustDNAProfiler /> */}
      </main>
    </div>
  );
}
