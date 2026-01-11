/* controllers/orderController.js */
const Order = require('../models/Order');

// 1. สร้างออเดอร์
exports.createOrder = async (req, res) => {
    try {
        const { customerName, tel, address, totalPrice, items } = req.body;
        
        let slipImagePath = '';
        if (req.file) {
            slipImagePath = '/uploads/' + req.file.filename;
        }

        // แปลง items (กันพัง)
        let parsedItems = [];
        try {
            parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        } catch (e) {
            console.error("Parse items error:", e);
            parsedItems = [];
        }

        const newOrder = new Order({
            userId: req.user ? req.user.userId : null,
            customerName,
            tel,
            address,
            items: parsedItems,
            totalPrice: Number(totalPrice),
            slipImage: slipImagePath,
            status: 'pending'
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order created', order: newOrder });
    } catch (err) {
        console.error("Create order error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 2. ดึงออเดอร์ทั้งหมด (Admin) - ✅ ตัวนี้ต้องมี!
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. อัปเดตสถานะ
exports.updateOrderStatus = async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. ดึงออเดอร์ของฉัน
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};