// backend/controllers/vendorController.js
const Vendor  = require('../models/Vendor');
const Product = require('../models/Product');
const Review  = require('../models/Review');

// GET /api/vendor/profile
exports.getProfile = async (req, res) => {
  try {
    const vendorId = req.vendorId;          // set by auth middleware
    const vendor   = await Vendor.findById(vendorId).select('-password');
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/vendor/products
exports.getProducts = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const products = await Product.find({ seller: vendorId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/vendor/products/:prodId
exports.getProductDetail = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { prodId } = req.params;
    // 1) fetch product (ensure it belongs to this vendor)
    const product = await Product.findOne({ _id: prodId, seller: vendorId });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // 2) purchase & return counts (assuming you have an Order model)
    const Order = require('../models/Order');
    const purchases = await Order.countDocuments({ product: prodId, status: 'purchased' });
    const returns   = await Order.countDocuments({ product: prodId, status: 'returned' });
    const returnRate = purchases === 0 ? 0 : (returns / purchases) * 100;

    // 3) reviews & avg trustScore
    const reviews = await Review.find({ product: prodId }).select('text isAuthentic createdAt');
    const avgTrust = reviews.length
      ? reviews.reduce((sum, r) => sum + (r.isAuthentic ? 1 : 0), 0) / reviews.length * 100
      : 0;

    res.json({
      product,
      stats: { purchases, returns, returnRate },
      reviews,
      avgTrustScore: avgTrust
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
