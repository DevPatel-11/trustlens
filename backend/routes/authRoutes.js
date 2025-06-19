const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

// Customer endpoints
router.post('/customer/signup', signup);
router.post('/customer/login',  login);

module.exports = router;
