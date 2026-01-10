const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, default: 'No Brand' },
    category: { 
        type: String, 
        required: true,
        enum: ['football', 'futsal', 'running', 'basketball', 'sneaker', 'other'], 
        default: 'other'
    },
    price: { type: Number, required: true },
    description: String,
    
    // ✅ แก้ไขตรงนี้: เปลี่ยนชื่อเป็น inStock
    inStock: { type: Boolean, default: true },
    
    sizes: [{ type: String }],
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);