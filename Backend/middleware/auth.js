// middleware/auth.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ message: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'A token is required for authentication' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid Token' });
    }
};

// Middleware to check if the authenticated user is an admin
exports.isAdmin = (req, res, next) => {
    // No change needed here, as req.user already contains the 'role' from JWT
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};

// Middleware to check if the authenticated user is a mentor (admin is NOT a mentor by this definition)
exports.isMentor = (req, res, next) => {
    // No change needed here
    if (req.user && req.user.role === 'mentor') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Mentor role required.' });
    }
};

// Middleware to check if the authenticated user is a mentee
exports.isMentee = (req, res, next) => {
    // No change needed here
    if (req.user && req.user.role === 'mentee') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Mentee role required.' });
    }
};