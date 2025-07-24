const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Define the routes
router.get('/mentors', adminController.getAllMentors);
router.get('/mentees', adminController.getAllMentees);
router.get('/requests', adminController.getAllRequests);

module.exports = router;
