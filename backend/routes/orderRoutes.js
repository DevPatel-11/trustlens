const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Helper function to extract IP address
const extractIPAddress = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// @route   POST /api/orders/test
// @desc    Test order creation
// @access  Public
router.post('/test', async (req, res) => {
  try {
    const order = new Order({
      customer: '6857920cc2ccae45651063f4',
      customerEmail: 'test@test.com',
      customerName: 'Test User',
      product: '6854f36e02f89bb95cacbbd6',
      productName: 'Test Product',
      productPrice: 100,
      productImage: 'test.jpg',
      vendor: '685452eb5917db3a6cd4c3b0',
      vendorName: 'Test Vendor',
      vendorTrustScore: 50,
      quantity: 1,
      totalAmount: 100,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345'
      },
      paymentMethod: 'Cash on Delivery',
      orderNumber: `TL${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
    });
    
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    console.error('Test order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/orders
// @desc    Place a new order
// @access  Public (will add auth later)
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      productId,
      quantity = 1,
      shippingAddress,
      paymentMethod = 'Cash on Delivery'
    } = req.body;

    // Validate required fields
    if (!customerId || !productId || !shippingAddress) {
      return res.status(400).json({ 
        error: 'Customer ID, Product ID, and shipping address are required' 
      });
    }

    // Fetch customer details
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch product details using direct API call to avoid population issues
    const productResponse = await fetch(`http://localhost:3001/api/products/${productId}`);
    const product = await productResponse.json();
    
    if (!product || !product.name) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check inventory
    if (product.quantity < quantity) {
      return res.status(400).json({ 
        error: `Insufficient inventory. Only ${product.quantity} items available` 
      });
    }

    // Calculate total amount
    const totalAmount = product.price * quantity;

    // Extract IP address
    const ipAddress = extractIPAddress(req);

    // Get vendor data (prefer vendor over seller)
    const vendorData = product.vendor || product.seller;
    
    const order = new Order({
      customer: customerId,
      customerEmail: customer.email,
      customerName: customer.username,
      product: productId,
      productName: product.name,
      productPrice: product.price,
      productImage: product.images[0] || '',
      vendor: vendorData._id,
      vendorName: vendorData.name,
      vendorTrustScore: vendorData.trustScore || 50,
      quantity,
      totalAmount,
      shippingAddress,
      paymentMethod,
      ipAddress,
      orderNumber: `TL${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
    });

    await order.save();

    // Update product inventory
    await Product.findByIdAndUpdate(productId, {
      $inc: { 
        quantity: -quantity,
        totalSold: quantity
      }
    });

    // Update customer transaction count
    customer.transactionCount = (customer.transactionCount || 0) + 1;
    await customer.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order,
      orderNumber: order.orderNumber
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// @route   GET /api/orders/customer/:customerId
// @desc    Get all orders for a customer
// @access  Public (will add auth later)
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const orders = await Order.getCustomerOrders(customerId);
    
    res.json({
      orders,
      totalOrders: orders.length
    });

  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// @route   GET /api/orders/vendor/:vendorId
// @desc    Get all orders for a vendor
// @access  Public (will add auth later)
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const orders = await Order.getVendorOrders(vendorId);
    
    res.json({
      orders,
      totalOrders: orders.length
    });

  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// @route   GET /api/orders/:orderId
// @desc    Get order details by ID
// @access  Public (will add auth later)
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('customer', 'username email trustScore')
      .populate('product', 'name images category description')
      .populate('vendor', 'name trustScore rating');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// @route   PUT /api/orders/:orderId/status
// @desc    Update order status
// @access  Public (will add auth later)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, description, updatedBy = 'Customer', trackingNumber } = req.body;
    
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update tracking number if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
      await order.save();
    }
    
    await order.updateStatus(status, description, updatedBy);
    
    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// @route   POST /api/orders/:orderId/cancel
// @desc    Cancel an order
// @access  Public (will add auth later)
router.post('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason = 'Customer requested cancellation' } = req.body;
    
    const order = await Order.findById(orderId).populate('product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if order can be cancelled
    if (['Delivered', 'Cancelled', 'Returned'].includes(order.status)) {
      return res.status(400).json({ 
        error: `Cannot cancel order with status: ${order.status}` 
      });
    }
    
    // Update order status
    await order.updateStatus('Cancelled', reason, 'Customer');
    
    // Restore product inventory
    const product = await Product.findById(order.product._id);
    if (product) {
      product.quantity += order.quantity;
      product.totalSold = Math.max(0, (product.totalSold || 0) - order.quantity);
      await product.save();
    }
    
    res.json({
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (admin view)
// @access  Public (will add auth later)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('customer', 'username email')
      .populate('product', 'name category')
      .populate('vendor', 'name trustScore')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalOrders = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / parseInt(limit))
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// @route   GET /api/orders/stats/overview
// @desc    Get order statistics
// @access  Public (will add auth later)
router.get('/stats/overview', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'username')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      deliveryRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0,
      cancellationRate: totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0,
      recentOrders
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

module.exports = router; 