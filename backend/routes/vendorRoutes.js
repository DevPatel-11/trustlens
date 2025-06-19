const express = require('express');
const { signup, login } = require('../controllers/vendorAuthController');
const router = express.Router();

// Vendor endpoints
router.post('/vendor/signup', signup);
router.post('/vendor/login',  login);

module.exports = router;
