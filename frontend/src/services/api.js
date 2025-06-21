import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// at top:


// const api = axios.create({
//   baseURL: 'http://localhost:3001/api',
//   headers: { 'Content-Type': 'application/json' },
// });

export const signupCustomer = data => api.post('/auth/customer/signup', data);
export const loginCustomer  = data => api.post('/auth/customer/login', data);
export const signupVendor   = data => api.post('/vendor/vendor/signup', data);
export const loginVendor    = data => api.post('/vendor/vendor/login', data);

export const apiService = {
  // User APIs
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  // TODO: Add this endpoint to backend when ready
  getTrustScoreHistory: () => api.get('/users/trust-score-history'),
  
  // IP Analysis APIs
  getUserIPAnalysis: (userId) => api.get(`/users/${userId}/ip-analysis`),
  recalculateUserTrust: (userId) => api.post(`/users/${userId}/recalculate-trust`),

  // NEW: Seller Analytics APIs (Users)
  getSellerAnalytics: (sellerId) => api.get(`/users/${sellerId}/seller-analytics`),
  recalculateSellerTrust: (sellerId) => api.post(`/users/${sellerId}/recalculate-seller-trust`),

  // NEW: Vendor APIs
  getVendors: () => api.get('/vendor/vendors'),
  getVendorById: (vendorId) => api.get(`/vendor/vendors/${vendorId}`),
  getVendorAnalytics: (vendorId) => api.get(`/vendor/vendors/${vendorId}/analytics`),
  recalculateVendorTrust: (vendorId) => api.post(`/vendor/vendors/${vendorId}/recalculate-trust`),

  // Product APIs
  getProducts: () => api.get('/products'),
  createProduct: (productData) => api.post('/products', productData),
  getProductById: (id) => api.get(`/products/${id}`),
  
  // NEW: Product Return Tracking APIs
  trackProductPurchase: (productId) => api.post(`/products/${productId}/purchase`),
  trackProductReturn: (productId, reason) => api.post(`/products/${productId}/return`, { reason }),
  getProductReturnAnalytics: (productId) => api.get(`/products/${productId}/return-analytics`),
  getProductAuditLogs: (productId) => api.get(`/products/${productId}/audit-logs`),

  // NEW: Product Lifecycle APIs
  getProductLifecycleInsights: (sellerId) => api.get(`/product-lifecycle/insights/${sellerId}`),
  getProductLifecycleAnalytics: (productId) => api.get(`/product-lifecycle/analytics/${productId}`),
  getProductLifecycleTimeline: (productId) => api.get(`/product-lifecycle/timeline/${productId}`),
  initializeProductLifecycle: (data) => api.post('/product-lifecycle/initialize', data),
  progressProductLifecycle: (data) => api.post('/product-lifecycle/progress', data),
  trackProductView: (data) => api.post('/product-lifecycle/track-view', data),

  // Review APIs
  getReviews: () => api.get('/reviews'),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getReviewsByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  voteOnReview: (reviewId, voteType) => api.post(`/reviews/${reviewId}/vote`, { voteType }),
  analyzeReview: (content) => api.post('/reviews/analyze', { content }),

  // Alert APIs
  getAlerts: () => api.get('/alerts'),
  getAlertsByType: (type) => api.get(`/alerts/type/${type}`),
  getAlertsBySeverity: (severity) => api.get(`/alerts/severity/${severity}`),
  resolveAlert: (id) => api.put(`/alerts/${id}/resolve`),
  dismissAlert: (id) => api.put(`/alerts/${id}/dismiss`),
  getAlertStats: () => api.get('/alerts/stats'),

  // Enhanced Review Authentication APIs
  getEnhancedReviewSummary: (reviewId) => api.get(`/enhanced-reviews/summary/${reviewId}`),
  authenticateReview: (reviewId, sourceData) => api.post(`/enhanced-reviews/authenticate/${reviewId}`, sourceData),
  getAuthenticationDetails: (reviewId) => api.get(`/enhanced-reviews/details/${reviewId}`),
  updateReviewDecision: (authId, decision) => api.put(`/enhanced-reviews/decision/${authId}`, decision),
  bulkAuthenticateReviews: (reviewIds) => api.post('/enhanced-reviews/bulk-authenticate', { reviewIds }),
  getAuthenticationStats: () => api.get('/enhanced-reviews/stats/overview'),
  getPendingReviews: () => api.get('/enhanced-reviews/pending-review'),
  progressWorkflow: (authId, workflowData) => api.post(`/enhanced-reviews/workflow/${authId}/progress`, workflowData),
  getDailyReviewStats: () => api.get('/enhanced-reviews/stats/daily'),
  getReviewAnalytics: () => api.get('/enhanced-reviews/analytics/overview'),

  // NEW: Marketplace Real-time APIs
  injectFraud: () => api.post('/products/inject-fraud'),
  getRealtimeStats: () => api.get('/products/stats/realtime'),
  getRealtimeActivity: () => api.get('/products/activity/realtime'),
};

export default apiService;
