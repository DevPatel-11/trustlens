const Product = require('../models/Product');

exports.buyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.quantity <= 0) return res.status(400).json({ message: 'Out of stock' });

    product.quantity -= 1;
    product.totalSold += 1;
    await product.save();

    res.json({ message: 'Product purchased successfully', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.returnProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.totalReturned += 1;
    product.quantity += 1; // ✅ This line is missing in your current code

    await product.save();

    res.json({ message: 'Product returned successfully', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
