const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: String,
    price: { type: Number, required: true },
    description: String,
    inStock: { type: Boolean, default: true },
    sizes: [{ type: String }],   // ✅ เก็บไซส์เป็น Array
    images: [{ type: String }],  // ✅ เก็บรูปเป็น Array
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);