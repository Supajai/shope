/* controllers/authController.js */
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register
exports.register = async (req, res) => {
    try {
        const { username, password, fullName, tel, address } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, fullName, tel, address });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '1d' });
        res.json({ token, role: user.role, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get Me (✅ ตัวปัญหาที่มักจะหายไป)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fullName, tel, address } = req.body;
        let updateData = { fullName, tel, address };

        if (req.files) {
            if (req.files['avatar']) updateData.avatar = '/uploads/' + req.files['avatar'][0].filename;
            if (req.files['cover']) updateData.coverImage = '/uploads/' + req.files['cover'][0].filename;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};