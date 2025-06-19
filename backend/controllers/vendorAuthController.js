const bcrypt = require('bcryptjs');
const jwt   = require('jsonwebtoken');
const Vendor= require('../models/Vendor');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Vendor Sign‑Up
exports.signup = async (req, res) => {
  try {
    const { name, companyEmail, contactPerson, addresses, password } = req.body;
    // hash password field on vendor schema if you add one (optional)
    // create vendor
    const vendor = await Vendor.create({ name, companyEmail, contactPerson, addresses });
    const token  = jwt.sign({ id: vendor._id, role: 'vendor' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ vendor, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Vendor Login
exports.login = async (req, res) => {
  try {
    const { companyEmail, password } = req.body;
    const vendor = await Vendor.findOne({ companyEmail });
    if (!vendor) throw new Error('Invalid credentials');
    // if you store a password on the vendor schema, compare it here
    const token = jwt.sign({ id: vendor._id, role: 'vendor' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ vendor, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
