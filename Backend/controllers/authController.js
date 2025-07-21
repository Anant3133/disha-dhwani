// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { LoginRequestDto, RegisterUserRequestDto, AuthResponseDto } = require('../dtos/authDto');

const createJwtPayload = (user, role) => {
    let payload = { id: user.id, email: user.email, role: role };
    return payload;
};

exports.login = async (req, res) => {
    const { email, password } = new LoginRequestDto(req.body.email, req.body.password);
    // Corrected: Access models directly from req.app.locals.db
    const { Admin, Mentor, Mentee } = req.app.locals.db; // Removed .models

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

        res.json(new AuthResponseDto(token, user, role));
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.registerUser = async (req, res) => {
    const { name, email, password, contact_number, role, expertise_areas } = new RegisterUserRequestDto(
        req.body.name, req.body.email, req.body.password, req.body.contact_number, req.body.role, req.body.expertise_areas
    );
    // Corrected: Access models directly from req.app.locals.db
    const { Admin, Mentor, Mentee } = req.app.locals.db; // Removed .models

    try {
        if (!name || !email || !password || !contact_number || !role) {
            return res.status(400).json({ message: 'Name, email, password, contact number, and role are required.' });
        }
        if (!['admin', 'mentor', 'mentee'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified. Must be admin, mentor, or mentee.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        let newUser = null;

        switch (role) {
            case 'admin':
                let existingAdmin = await Admin.findOne({ where: { email } });
                if (existingAdmin) return res.status(400).json({ message: 'Admin with this email already exists.' });
                newUser = await Admin.create({ name, email, password_hash, contact_number });
                break;
            case 'mentor':
                let existingMentor = await Mentor.findOne({ where: { email } });
                if (existingMentor) return res.status(400).json({ message: 'Mentor with this email already exists.' });
                let existingMentorPhone = await Mentor.findOne({ where: { contact_number } });
                if (existingMentorPhone) return res.status(400).json({ message: 'Mentor with this phone number already exists.' });

                newUser = await Mentor.create({
                    name,
                    email,
                    password_hash,
                    contact_number,
                    expertise_areas: expertise_areas || []
                });
                break;
            case 'mentee':
                let existingMenteeEmail = await Mentee.findOne({ where: { email } });
                if (existingMenteeEmail) {
                    return res.status(400).json({ message: 'Mentee with this email already exists.' });
                }
                let existingMenteePhone = await Mentee.findOne({ where: { phone_number: contact_number } });
                if (existingMenteePhone) {
                    return res.status(400).json({ message: 'Mentee with this phone number already exists.' });
                }

                newUser = await Mentee.create({
                    name,
                    email,
                    password_hash,
                    phone_number: contact_number,
                    current_learning_interest: null,
                    learning_level: 'unknown',
                    language_preference: 'en-IN'
                });
                break;
            default:
                return res.status(400).json({ message: 'Invalid role specified.' });
        }

        res.status(201).json({ message: `${role} registered successfully`, user: { id: newUser.id, name: newUser.name, email: newUser.email }, role });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};