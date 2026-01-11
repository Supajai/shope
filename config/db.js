/* config/db.js */
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // เช็คก่อนว่ามีค่า Connection String หรือไม่
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI is missing in .env file");
        }

        // เชื่อมต่อ MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ Error Connecting to Database: ${err.message}`);
        // ไม่ต้อง process.exit(1) ทันที เพื่อให้ Server ยังพยายามรันต่อได้ (เผื่อ debug)
    }
};

module.exports = connectDB;