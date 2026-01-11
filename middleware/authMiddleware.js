/* middleware/authMiddleware.js */
const jwt = require('jsonwebtoken');

// ต้องใช้ exports.ชื่อฟังก์ชัน
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};