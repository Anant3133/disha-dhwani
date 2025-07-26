// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// DTOs are removed as we will build the response object directly.

const createJwtPayload = (user, role) => {
    let payload = { id: user.id, email: user.email, role: role };
    return payload;
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const { Admin, Mentor, Mentee } = req.app.locals.db;

    try {
        let user = null;
        let role = null;

        user = await Admin.findOne({ where: { email } });
        if (user) role = 'admin';

        if (!user) {
            user = await Mentor.findOne({ where: { email } });
            if (user) role = 'mentor';
        }

        if (!user) {
            user = await Mentee.findOne({ where: { email } });
            if (user) role = 'mentee';
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            createJwtPayload(user, role),
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // FIX: Send a direct JSON object instead of using a DTO
        res.json({
            token: token,
            userId: user.id,
            role: role
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.registerUser = async (req, res) => {
    const { name, email, password, contact_number, role } = req.body;
    const { Admin, Mentor, Mentee } = req.app.locals.db;

    try {
        if (!name || !email || !password || !contact_number || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (!['admin', 'mentor', 'mentee'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        let newUser = null;

        // (Your user creation switch logic remains here...)
        switch (role) {
            case 'admin':
                let existingAdmin = await Admin.findOne({ where: { email } });
                if (existingAdmin) return res.status(400).json({ message: 'Admin with this email already exists.' });
                newUser = await Admin.create({ name, email, password_hash, contact_number });
                break;
            case 'mentor':
                let existingMentor = await Mentor.findOne({ where: { email } });
                if (existingMentor) return res.status(400).json({ message: 'Mentor with this email already exists.' });
                newUser = await Mentor.create({ name, email, password_hash, contact_number });
                break;
            case 'mentee':
                let existingMentee = await Mentee.findOne({ where: { email } });
                if (existingMentee) return res.status(400).json({ message: 'Mentee with this email already exists.' });
                newUser = await Mentee.create({ name, email, password_hash, phone_number: contact_number });
                break;
            default:
                return res.status(400).json({ message: 'Invalid role specified.' });
        }

        if (!newUser) {
            return res.status(400).json({ message: `Could not create user with role: ${role}.` });
        }

        const token = jwt.sign(
            createJwtPayload(newUser, role),
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // FIX: Send a direct JSON object instead of using a DTO
        res.status(201).json({
            token: token,
            userId: newUser.id,
            role: role
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};