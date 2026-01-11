const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    // ✅ แก้ตรงนี้: เปลี่ยน required เป็น false หรือลบทิ้งไปเลย
    email: { 
        type: String, 
        required: false, 
        unique: false 
    },
    fullName: { type: String },
    tel: { type: String },
    address: { type: String },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);