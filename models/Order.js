const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: String,
    tel: String,
    address: String,
    slipImage: String,
    totalPrice: Number,
    items: [
        {
            productName: String,
            size: String,
            price: Number,
            qty: Number
        }
    ],
    status: { 
        type: String, 
        enum: ['pending', 'paid', 'shipped', 'cancelled'], 
        default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);