const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();
const { getMe } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyTokenMiddleware');
// Customer endpoints
router.post('/customer/signup', signup);
router.post('/customer/login',  login);
router.get('/customer/me', verifyToken, getMe); // ✅ your new secured route

module.exports = router;
