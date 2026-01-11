/* routes/authRoutes.js */
const express = require('express');
const router = express.Router();

// Import Controller และ Middleware
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Debug: เช็คว่าโหลดฟังก์ชันมาครบไหม (ถ้า Server start แล้วเห็นบรรทัดนี้ error จะรู้ทันที)
if (!authController.getMe) {
    console.error("❌ CRITICAL ERROR: 'getMe' function is missing in authController!");
}
if (!authenticateToken) {
    console.error("❌ CRITICAL ERROR: 'authenticateToken' middleware is missing!");
}

// Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// ✅ บรรทัดที่ 20 ที่เคย Error
// ต้องแน่ใจว่า authenticateToken และ authController.getMe เป็น function ไม่ใช่ undefined
router.get('/me', authenticateToken, authController.getMe);

// Update Profile
router.put('/me', 
    authenticateToken, 
    upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), 
    authController.updateProfile
);

module.exports = router;