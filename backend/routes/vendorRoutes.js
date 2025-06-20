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



module.exports = router;
