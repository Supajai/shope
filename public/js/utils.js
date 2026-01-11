/* public/js/utils.js */

// 1. ตั้งค่า API URL (ถ้าไม่ได้เปลี่ยน Port ก็ใช้ /api ได้เลย)
const API_URL = '/api'; 

// 2. แปลงตัวเลขเป็นค่าเงินบาท (มีลูกน้ำคั่น)
function money(num) {
    return '฿' + Number(num || 0).toLocaleString();
}

// 3. สร้าง Header สำหรับส่งข้อมูลไปหลังบ้าน
// สำคัญมาก: ฟังก์ชันนี้จะแนบ Token ไปด้วย และจัดการเรื่อง Content-Type ให้
function getHeaders(isMultipart = false) {
    const headers = {};
    const token = localStorage.getItem('token');
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // ถ้าไม่ใช่การอัปโหลดไฟล์ (Multipart) ให้บอกว่าเป็น JSON
    // **สำคัญ:** ถ้าส่ง FormData (มีรูปภาพ) ห้ามใส่ Content-Type เด็ดขาด Browser จะจัดการเอง
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
}

// 4. ฟังก์ชันแจ้งเตือนสวยๆ (Toast Notification)
// รองรับหน้า Admin ที่เราทำไว้
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    // ถ้าไม่มีกล่อง Toast ในหน้า HTML ให้ใช้ Alert ธรรมดาแทน
    if (!container) {
        console.log(message); // Debug
        // alert(message); // เปิดบรรทัดนี้ถ้าอยากให้เด้ง Alert ด้วย
        return;
    }

    const toast = document.createElement('div');
    
    // ดีไซน์ด้วย Tailwind CSS
    const baseClasses = "px-6 py-3 rounded-xl shadow-2xl text-white font-bold text-sm transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 min-w-[200px] z-[1000]";
    const bgClass = type === 'error' ? "bg-red-600" : "bg-slate-900"; 
    const icon = type === 'error' ? '<i class="fas fa-exclamation-circle text-lg"></i>' : '<i class="fas fa-check-circle text-lg text-green-400"></i>';

    toast.className = `${baseClasses} ${bgClass}`;
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    container.appendChild(toast);

    // Animation เข้า
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    // ลบออกอัตโนมัติใน 3 วินาที
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0'); // Animation ออก
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 5. ออกจากระบบ
function logout() {
    if(confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// 6. ตรวจสอบสถานะ Login (ใช้ในหน้าทั่วไป)
function checkAuth() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    // Update UI ตามสถานะ (ถ้ามี Elements เหล่านี้ในหน้า)
    const authLink = document.getElementById('auth-link');
    const cartCount = document.getElementById('cart-count-badge');

    // อัปเดตตะกร้า
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.innerText = count;
        cartCount.classList.toggle('hidden', count === 0);
    }

    // อัปเดตเมนู Login/Logout
    if (authLink) {
        if (token) {
            let html = '';
            if (userRole === 'admin') {
                html += `<a href="admin.html" class="mr-4 font-bold text-red-600 hover:underline">ADMIN</a>`;
            }
            html += `<button onclick="logout()" class="font-bold hover:text-red-600">LOGOUT</button>`;
            authLink.innerHTML = html;
        } else {
            authLink.innerHTML = `<a href="login.html" class="font-bold hover:text-blue-600">LOGIN</a>`;
        }
    }
}