const bcrypt = require('bcryptjs');
const jwt   = require('jsonwebtoken');
const Vendor= require('../models/Vendor');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Vendor Sign‑Up
exports.signup = async (req, res) => {
  try {
    const { name, companyEmail, contactPerson, addresses, password } = req.body;
    
    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ companyEmail });
    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create vendor
    const vendor = await Vendor.create({ 
      name, 
      companyEmail, 
      contactPerson, 
      addresses,
      password: hashedPassword
    });
    
    // Generate JWT token
    const token = jwt.sign({ id: vendor._id, role: 'vendor' }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const vendorResponse = vendor.toObject();
    delete vendorResponse.password;
    
    res.status(201).json({ vendor: vendorResponse, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Vendor Login
exports.login = async (req, res) => {
  try {
    const { companyEmail, password } = req.body;
    
    // Find vendor by email
    const vendor = await Vendor.findOne({ companyEmail });
    if (!vendor) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, vendor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: vendor._id, role: 'vendor' }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const vendorResponse = vendor.toObject();
    delete vendorResponse.password;
    
    res.json({ vendor: vendorResponse, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
