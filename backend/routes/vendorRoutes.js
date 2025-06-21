// const express = require('express');
// const { signup, login } = require('../controllers/vendorAuthController');
// const router = express.Router();

// // Vendor endpoints
// router.post('/vendor/signup', signup);
// router.post('/vendor/login',  login);

// module.exports = router;
const express = require('express');
const { signup, login } = require('../controllers/vendorAuthController');
const {
  getProfile,
  getProducts,
  getProductDetail
} = require('../controllers/vendorController');

const authMiddleware = require('../middleware/authMiddleware');
const protectVendor = authMiddleware('vendor');

const router = express.Router();

// Public: signup & login
router.post('/vendor/signup', signup);
router.post('/vendor/login',  login);

// Protected: only for logged‑in vendors
router.get('/profile',          protectVendor, getProfile);
router.get('/products',         protectVendor, getProducts);
router.get('/products/:prodId', protectVendor, getProductDetail);

// Admin vendor analytics and trust management
const TrustAnalyzer = require('../utils/trustAnalyzer');
const Vendor = require('../models/Vendor');

// Get all vendors
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vendor by ID
router.get('/vendors/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vendor analytics (return rates, trust scores)
router.get('/vendors/:id/analytics', async (req, res) => {
  try {
    const analytics = await TrustAnalyzer.getSellerReturnAnalytics(req.params.id);
    
    if (!analytics) {
      return res.status(404).json({ message: 'Vendor analytics not found' });
    }
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Recalculate vendor trust score based on return rates
router.post('/vendors/:id/recalculate-trust', async (req, res) => {
  try {
    const result = await TrustAnalyzer.calculateSellerTrustWithReturnRate(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Unable to recalculate vendor trust score' });
    }
    
    res.json({
      success: true,
      message: 'Vendor trust score recalculated based on return rates',
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
