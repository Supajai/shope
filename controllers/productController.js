const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// ✅ ฟังก์ชันดึงสินค้า (ปรับปรุงระบบค้นหาใหม่)
exports.getAllProducts = async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, search, sort } = req.query;
        let query = {};

        // 1. กรองหมวดหมู่ (ถ้ามีการเลือก)
        if (category && category !== 'all') {
            query.category = category;
        }

        // 2. กรองแบรนด์ (Checkbox)
        if (brand) {
            const brands = brand.split(',');
            // ใช้ RegExp เพื่อให้หาเจอแม้ตัวพิมพ์เล็กใหญ่ต่างกัน
            query.brand = { $in: brands.map(b => new RegExp(`^${b}$`, 'i')) };
        }
        
        // 3. กรองราคา
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // ✅ 4. ระบบค้นหาอัจฉริยะ (ค้นหา ชื่อ OR แบรนด์ OR หมวดหมู่)
        if (search) {
            // ตัดช่องว่างหน้าหลัง และแปลง special characters เพื่อป้องกัน error
            const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // สร้าง Regex แบบ 'i' (Case Insensitive - ไม่สนตัวพิมพ์เล็กใหญ่)
            const searchRegex = new RegExp(cleanSearch, 'i');

            // ใช้ $or เพื่อบอกว่า "ขอแค่ตรงกับสักอันก็พอ"
            // ถ้ามี query อื่นอยู่แล้ว (เช่น filter ราคา) ให้ใช้ $and เชื่อม
            const searchQuery = {
                $or: [
                    { name: { $regex: searchRegex } },      // ค้นในชื่อสินค้า
                    { brand: { $regex: searchRegex } },     // ค้นในชื่อแบรนด์
                    { category: { $regex: searchRegex } },  // ค้นในหมวดหมู่
                    { description: { $regex: searchRegex } } // แถม: ค้นในรายละเอียดสินค้าด้วย
                ]
            };

            // รวมกับ query เดิมที่มีอยู่
            if (Object.keys(query).length > 0) {
                query = { $and: [query, searchQuery] };
            } else {
                query = searchQuery;
            }
        }

        // 5. การเรียงลำดับ
        let sortOption = { createdAt: -1 }; // ค่าเริ่มต้น: ใหม่ล่าสุด
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };

        const products = await Product.find(query).sort(sortOption);
        res.json(products);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// ... (ส่วน createProduct, updateProduct, deleteProduct เหมือนเดิม ไม่ต้องแก้) ...
// เพื่อความชัวร์ ก๊อปปี้ส่วนล่างนี้ไปวางต่อได้เลยครับ

exports.createProduct = async (req, res) => {
    try {
        const { name, brand, price, description, stock, sizes, category } = req.body;
        
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => '/uploads/' + file.filename);
        }
        
        const isStockAvailable = String(stock) === 'true';

        const product = new Product({
            name, 
            brand: brand || 'No Brand',
            price: Number(price), 
            description, 
            category: category || 'other', 
            inStock: isStockAvailable,
            sizes: sizes ? sizes.split(',').map(s => s.trim()) : [],
            images: imagePaths
        });

        await product.save();
        res.status(201).json({ message: 'Product added successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, brand, price, description, stock, sizes, category } = req.body;
        const isStockAvailable = String(stock) === 'true';

        let updateData = { 
            name, brand, price: Number(price), description, category, inStock: isStockAvailable 
        };
        
        if (sizes) updateData.sizes = sizes.split(',').map(s => s.trim());
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => '/uploads/' + file.filename);
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.json({ message: 'Updated successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (product && product.images) {
            product.images.forEach(img => {
                const p = path.join(__dirname, '../public', img);
                if(fs.existsSync(p)) fs.unlinkSync(p);
            });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};