const bcrypt = require('bcryptjs');
const jwt   = require('jsonwebtoken');
const User  = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Helper function to extract IP address
const extractIPAddress = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer Sign‑Up
exports.signup = async (req, res) => {
  try {
    const { username, email, mobileNumber, password } = req.body;
    
    // Extract IP address
    const ipAddress = extractIPAddress(req);
    console.log('🌐 User signup IP:', ipAddress);
    
    // 1) Hash password
    const hash = await bcrypt.hash(password, 12);
    
    // 2) Create user with IP address
    const user = await User.create({ 
      username, 
      email, 
      mobileNumber, 
      password: hash,
      ipAddress: ipAddress 
    });
    
    // 3) Issue JWT
    const token = jwt.sign({ id: user._id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Customer Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Extract IP address
    const ipAddress = extractIPAddress(req);
    console.log('🌐 User login IP:', ipAddress);
    
    // 1) Find user
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid email or password');
    
    // 2) Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid email or password');
    
    // 3) Update IP address if not already stored or if changed
    if (!user.ipAddress || user.ipAddress !== ipAddress) {
      user.ipAddress = ipAddress;
      await user.save();
      console.log('📝 Updated user IP address:', ipAddress);
    }
    
    // 4) Issue JWT
    const token = jwt.sign({ id: user._id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
