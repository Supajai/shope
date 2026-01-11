/* controllers/productController.js */
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Helper: แปลง sizes string เป็น array
const parseSizes = (sizesStr) => {
    if (!sizesStr) return [];
    return sizesStr.split(',').map(s => s.trim()).filter(s => s !== '');
};

// 1. ดึงสินค้าทั้งหมด (พร้อมระบบ Search & Filter)
exports.getAllProducts = async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, search, sort } = req.query;
        let query = {};

        // 1.1 กรองตามหมวดหมู่
        if (category && category !== 'all') {
            query.category = category;
        }

        // 1.2 กรองตามแบรนด์
        if (brand) {
            const brands = brand.split(',');
            query.brand = { $in: brands.map(b => new RegExp(b, 'i')) };
        }

        // 1.3 กรองตามราคา
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // 1.4 ค้นหาด้วยชื่อ
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        // 1.5 เรียงลำดับ
        let sortOption = { createdAt: -1 }; // Default: ใหม่สุด
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };

        const products = await Product.find(query).sort(sortOption);
        res.json(products);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. ดึงสินค้าชิ้นเดียว (สำหรับหน้า Product Detail)
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. เพิ่มสินค้าใหม่ (Admin)
exports.createProduct = async (req, res) => {
    try {
        console.log('📦 Creating Product:', req.body);
        
        const { name, brand, price, description, stock, sizes, category } = req.body;
        
        // จัดการรูปภาพ
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => '/uploads/' + file.filename);
        }

        const product = new Product({
            name, 
            brand: brand || 'No Brand',
            price: Number(price), 
            description: description || '', // ✅ บันทึก Description
            category: category || 'other',
            inStock: (stock === 'true' || stock === true),
            sizes: parseSizes(sizes),
            images: imagePaths
        });

        await product.save();
        res.status(201).json({ message: 'Product added successfully', product });

    } catch (err) {
        console.error('❌ Create Product Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// 4. แก้ไขสินค้า (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const { name, brand, price, description, stock, sizes, category } = req.body;
        
        let updateData = {
            name, 
            brand, 
            price: Number(price), 
            description, // ✅ อัปเดต Description
            category,
            inStock: (stock === 'true' || stock === true)
        };

        if (sizes) {
            updateData.sizes = parseSizes(sizes);
        }

        // ถ้ามีการอัปโหลดรูปใหม่ ให้ทับรูปเดิม
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => '/uploads/' + file.filename);
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Updated successfully', product: updatedProduct });

    } catch (err) {
        console.error('❌ Update Product Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// 5. ลบสินค้า (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // ลบไฟล์รูปออกจากโฟลเดอร์เพื่อคืนพื้นที่
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                // img = /uploads/filename.jpg -> ตัด /uploads/ ออก หรือใช้ path.basename
                const filename = path.basename(img); 
                const filePath = path.join(__dirname, '../public/uploads', filename);
                
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // ลบไฟล์
                }
            });
        }

        res.json({ message: 'Deleted successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};