// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  status: {
    type: String,
    enum: ['purchased', 'returned'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
