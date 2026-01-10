const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
    try {
        const orderData = { ...req.body, userId: req.user._id };
        const order = new Order(orderData);
        await order.save();
        res.json(order);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.json({ message: 'Updated' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};