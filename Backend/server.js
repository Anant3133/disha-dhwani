// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Import Sequelize models
const db = require('./models');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For URL-encoded request bodies (crucial for webhooks)

// Database Synchronization
db.sequelize.sync({ force: true }) // WARNING: force: true DROPS existing tables!
    .then(() => {
        console.log('Database & tables created/synced successfully with Sequelize!');
        console.log('Models loaded into db.models:', Object.keys(db));
        // Seed initial admin/mentor data here if needed (e.g., via authController.registerUser endpoint)
    })
    .catch(err => {
        console.error('Failed to sync database:', err.message);
        process.exit(1);
    });

// Make db (Sequelize models) accessible to routes via req.app.locals.db
app.locals.db = db;
// Import Routes
const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/mentor'); // Will contain mentor-specific APIs
const adminRoutes = require('./routes/admin');   // Will contain admin-specific APIs
const menteeRoutes = require('./routes/mentee'); // Will contain mentee-specific APIs
const webhookRoutes = require('./routes/webhook'); // For AI/Telecom webhooks

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mentee', menteeRoutes); // New route prefix for mentee-specific APIs
app.use('/api/webhooks', webhookRoutes);

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Disha Dhwani Backend is running and connected via Sequelize!');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke on the server!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});