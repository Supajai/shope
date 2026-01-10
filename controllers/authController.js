const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ error: 'Username exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, email });
        await user.save();
        res.json({ message: 'User created' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'User not found' });

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { _id: user._id, role: user.role, username: user.username },
                process.env.JWT_SECRET
            );
            res.json({ token, role: user.role, username: user.username });
        } else {
            res.status(400).json({ error: 'Invalid password' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};