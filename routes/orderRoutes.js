/* routes/orderRoutes.js */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- DEBUG ZONE (เช็คว่าฟังก์ชันมีตัวตนไหม) ---
if (!orderController.createOrder) console.error("❌ MISSING: orderController.createOrder");
if (!orderController.getAllOrders) console.error("❌ MISSING: orderController.getAllOrders");
if (!authenticateToken) console.error("❌ MISSING: authenticateToken");
if (!upload) console.error("❌ MISSING: upload middleware");
// ------------------------------------------

// 1. สร้างออเดอร์ (POST /api/orders)
router.post('/', 
    authenticateToken, 
    upload.single('slipImage'), 
    orderController.createOrder
);

// 2. ดูออเดอร์ทั้งหมด (GET /api/orders)
// ⚠️ บรรทัดนี้คือจุดที่เคย Error ถ้า getAllOrders หายไป
router.get('/', 
    authenticateToken, 
    orderController.getAllOrders
);

// 3. อัปเดตสถานะ (PUT /api/orders/:id)
router.put('/:id', 
    authenticateToken, 
    orderController.updateOrderStatus
);

module.exports = router;