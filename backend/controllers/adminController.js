// backend/controllers/adminController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const Admin  = require('../models/Admin');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) throw new Error('Invalid credentials');
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
