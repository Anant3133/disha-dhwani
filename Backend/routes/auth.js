// routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Route for unified user registration (Admin, Mentor, or Mentee)
router.post('/register', authController.registerUser); // CORRECTED: Renamed function
// Route for unified login
router.post('/login', authController.login);

module.exports = router;