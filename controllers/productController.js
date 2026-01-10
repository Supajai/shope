const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Helper function แปลง sizes string เป็น array
const parseSizes = (sizesStr) => {
    if (!sizesStr) return [];
    return sizesStr.split(',').map(s => s.trim()).filter(s => s !== '');
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        console.log('Body:', req.body); // Debug ดูค่าที่ส่งมา
        console.log('Files:', req.files); // Debug ดูไฟล์

        const { name, brand, price, description, stock, sizes } = req.body;
        
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => '/uploads/' + file.filename);
        }

        const product = new Product({
            name, 
            brand, 
            price, 
            description,
            inStock: stock === 'true',
            sizes: parseSizes(sizes), // ✅ แปลงไซส์ที่นี่
            images: imagePaths
        });

        await product.save();
        res.status(201).json({ message: 'Product added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, brand, price, description, stock, sizes } = req.body;
        
        let updateData = {
            name, brand, price, description,
            inStock: stock === 'true'
        };

        if (sizes) {
            updateData.sizes = parseSizes(sizes);
        }

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => '/uploads/' + file.filename);
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (product && product.images) {
            product.images.forEach(img => {
                const p = path.join(__dirname, '../public', img);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};