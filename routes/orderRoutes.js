const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, verifyAdmin, orderController.getAllOrders);
router.put('/:id', authenticateToken, verifyAdmin, orderController.updateOrderStatus);
router.put('/:id', authenticateToken, orderController.updateOrderStatus);

module.exports = router;