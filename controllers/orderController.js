/* controllers/orderController.js */
const Order = require('../models/Order');

// สร้างออเดอร์ใหม่ (พร้อมรับรูปสลิป)
exports.createOrder = async (req, res) => {
    try {
        const { customerName, tel, address, totalPrice, items } = req.body;
        
        // จัดการรูปสลิป
        let slipImagePath = '';
        if (req.file) {
            slipImagePath = '/uploads/' + req.file.filename;
        }

        // แปลงรายการสินค้าจาก JSON String เป็น Object (เพราะ FormData ส่งมาเป็น String)
        let parsedItems = [];
        try {
            parsedItems = JSON.parse(items);
        } catch (e) {
            parsedItems = items; // เผื่อกรณีส่งมาเป็น object อยู่แล้ว
        }

        const newOrder = new Order({
            userId: req.user ? req.user.userId : null, // ถ้าไม่ได้ล็อกอินก็เป็น null
            customerName,
            tel,
            address,
            items: parsedItems,
            totalPrice: Number(totalPrice),
            slipImage: slipImagePath, // ✅ บันทึก path รูป
            status: 'pending'
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order placed successfully', order: newOrder });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to place order' });
    }
};

// ดึงออเดอร์ทั้งหมด (สำหรับ Admin)
exports.getAllOrders = async (req, res) => {
    try {
        // เรียงลำดับจากใหม่ไปเก่า
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// อัปเดตสถานะออเดอร์
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ดึงออเดอร์ของ User คนนั้นๆ
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};