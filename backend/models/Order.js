const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },

  // Product Information
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },

  // Vendor Information (can be Vendor or User/Seller)
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  vendorTrustScore: {
    type: Number,
    default: 50
  },

  // Order Details
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending'
  },
  
  // Shipping Information
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery'],
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  
  // Tracking Information
  trackingNumber: {
    type: String,
    default: null
  },
  estimatedDelivery: {
    type: Date,
    default: function() {
      // Default to 7 days from now
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },
  
  // Trust and Security
  orderTrustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  fraudRisk: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  ipAddress: {
    type: String,
    default: null
  },
  
  // Order Timeline
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    description: String,
    updatedBy: { type: String, default: 'System' }
  }],
  
  // Review and Rating
  reviewSubmitted: {
    type: Boolean,
    default: false
  },
  customerRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Metadata
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    // Generate order number: TL + timestamp + random 4 digits
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    this.orderNumber = `TL${timestamp}${random}`;
  }
  
  // Add initial timeline entry
  if (this.isNew) {
    this.timeline.push({
      status: 'Pending',
      description: 'Order placed successfully',
      timestamp: new Date()
    });
  }
  
  next();
});

// Calculate order trust score based on customer and vendor trust
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Simple trust score calculation (can be enhanced with AI)
    const customerTrust = 50; // Default, will be fetched from customer data
    const vendorTrust = this.vendorTrustScore || 50;
    this.orderTrustScore = Math.round((customerTrust + vendorTrust) / 2);
    
    // Determine fraud risk
    if (this.orderTrustScore >= 70) {
      this.fraudRisk = 'Low';
    } else if (this.orderTrustScore >= 40) {
      this.fraudRisk = 'Medium';
    } else {
      this.fraudRisk = 'High';
    }
  }
  next();
});

// Instance method to update order status
orderSchema.methods.updateStatus = function(newStatus, description = '', updatedBy = 'System') {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    description: description || `Order status updated to ${newStatus}`,
    timestamp: new Date(),
    updatedBy: updatedBy
  });
  return this.save();
};

// Static method to get orders by customer
orderSchema.statics.getCustomerOrders = function(customerId) {
  return this.find({ customer: customerId })
    .populate('product', 'name images category')
    .populate('vendor', 'name trustScore')
    .sort({ createdAt: -1 });
};

// Static method to get orders by vendor
orderSchema.statics.getVendorOrders = function(vendorId) {
  return this.find({ vendor: vendorId })
    .populate('customer', 'username email')
    .populate('product', 'name images category')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', orderSchema); 