/* =========================================
   1. CONFIG & UTILS (ค่าตั้งต้น)
   ========================================= */
const API_URL = '/api'; // URL หลักของ Backend
const money = (num) => '฿' + Number(num).toLocaleString(); // แปลงตัวเลขเป็นเงินบาท

// สร้าง Header สำหรับส่ง Token (ใช้กับ API ที่ต้องล็อกอิน)
function getHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    } : { 'Content-Type': 'application/json' };
}

// ฟังก์ชันดึงรูปภาพ (รองรับทั้งระบบเก่า image และระบบใหม่ images)
function getProductImage(product) {
    if (product.images && product.images.length > 0) {
        return product.images[0]; // ใช้รูปแรกจากอัลบั้ม
    }
    return product.image || 'https://via.placeholder.com/400?text=No+Image';
}

/* =========================================
   2. UI HELPERS (แจ้งเตือน & หน้าต่าง)
   ========================================= */
// Toast Notification (แจ้งเตือนมุมขวาบน)
function showToast(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-24 right-5 z-[100] flex flex-col gap-2';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `px-6 py-4 rounded shadow-2xl flex items-center gap-3 font-bold uppercase text-xs tracking-widest min-w-[250px] transform transition-all duration-300 translate-x-full opacity-0 ${type === 'error' ? 'bg-red-600 text-white' : 'bg-black text-white'}`;
    toast.innerHTML = `<span>${type === 'error' ? '!' : '✓'}</span> ${msg}`;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.remove('translate-x-full', 'opacity-0'));
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modal Logic (เปิด/ปิดหน้าต่างยืนยัน)
function openModal(id) {
    const el = document.getElementById(id);
    if(el) el.classList.remove('hidden');
}
function closeModal(id) {
    const el = document.getElementById(id);
    if(el) el.classList.add('hidden');
}

/* =========================================
   3. AUTH SYSTEM (ระบบสมาชิก)
   ========================================= */
function checkAuthUI() {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const authDiv = document.getElementById('auth-menu');
    const cartBadge = document.getElementById('cart-badge');
    
    // อัปเดตตัวเลขในตะกร้า
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if(cartBadge) cartBadge.innerText = cart.length;

    if (authDiv) {
        if (username) {
            let html = `<span class="hidden md:inline mr-3 text-gray-500 font-bold text-xs uppercase">Hi, ${username}</span>`;
            if (role === 'admin') {
                html += `<a href="admin.html" class="text-red-600 font-bold mr-3 text-xs border border-red-200 px-2 py-1 bg-red-50 rounded hover:bg-red-600 hover:text-white transition">ADMIN PANEL</a>`;
            }
            html += `<button onclick="logout()" class="text-xs font-bold hover:text-red-600">LOGOUT</button>`;
            authDiv.innerHTML = html;
        } else {
            authDiv.innerHTML = `<a href="login.html" class="hover:text-red-600 font-bold text-xs">LOGIN</a> <span class="mx-2 text-gray-300">|</span> <a href="register.html" class="hover:text-red-600 font-bold text-xs">JOIN</a>`;
        }
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

/* =========================================
   4. DATA FETCHING (ดึงข้อมูลสินค้า)
   ========================================= */
// เก็บข้อมูลสินค้าไว้ใช้งาน (เช่น ตอนกด Edit หรือดูรายละเอียด)
window.productsCache = []; 

async function fetchProducts(containerId, isForAdmin = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        window.productsCache = products;

        if (products.length === 0) {
            container.innerHTML = isForAdmin 
                ? '<tr><td colspan="5" class="p-8 text-center text-gray-400">No products found.</td></tr>'
                : '<div class="col-span-full text-center py-20 text-gray-400">New collection coming soon...</div>';
            return;
        }

        if (isForAdmin) {
            // --- ADMIN VIEW (Table) ---
            // *หมายเหตุ: การ Render หน้า Admin จะถูกจัดการใน admin.html เป็นหลัก แต่ฟังก์ชันนี้เตรียมไว้เผื่อใช้
            // (ดูไฟล์ admin.html สำหรับ Logic เต็มรูปแบบ)
        } else {
            // --- USER VIEW (Card Grid - Wow Effect) ---
            container.innerHTML = products.map((p, i) => {
                const isSoldOut = !p.inStock;
                const delay = i * 100; // Animation delay
                const img = getProductImage(p);

                return `
                <div class="group relative bg-white rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl" 
                     style="opacity:0; animation: fadeIn 0.6s ease-out ${delay}ms forwards;">
                    <a href="product.html?id=${p._id}" class="block h-full">
                        <div class="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                            <img src="${img}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110 ${isSoldOut ? 'grayscale opacity-60' : ''}">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            
                            ${isSoldOut 
                                ? `<div class="absolute top-3 right-3 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase">SOLD OUT</div>` 
                                : `<div class="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">NEW</div>`
                            }

                            <div class="absolute bottom-4 left-0 w-full text-center translate-y-full group-hover:translate-y-0 transition duration-300 opacity-0 group-hover:opacity-100 px-4">
                                <span class="bg-white text-black w-full block py-3 font-bold uppercase text-xs tracking-widest shadow-lg hover:bg-black hover:text-white transition">View Details</span>
                            </div>
                        </div>
                        <div class="p-4">
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">${p.brand || 'Sneaker'}</p>
                            <h3 class="font-black text-lg uppercase truncate mb-1">${p.name}</h3>
                            <p class="font-mono font-bold text-sm ${isSoldOut?'text-gray-400 line-through':'text-black'}">${money(p.price)}</p>
                        </div>
                    </a>
                </div>`;
            }).join('');
            
            // Add Animation CSS
            if(!document.getElementById('anim-style')) {
                const s = document.createElement('style'); s.id = 'anim-style';
                s.innerHTML = `@keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`;
                document.head.appendChild(s);
            }
        }
    } catch (err) { console.error(err); }
}

/* =========================================
   5. CART SYSTEM (ตะกร้าสินค้า)
   ========================================= */
function addToCart(product, size) {
    if (!product.inStock) return showToast('ขออภัย สินค้าหมด (Out of Stock)', 'error');
    if (!size) return showToast('กรุณาเลือกไซส์ (Please select size)', 'error');

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // บันทึกรูปลงตะกร้าด้วย (เพื่อเอาไปโชว์ในหน้า Cart)
    const cartItem = {
        ...product,
        image: getProductImage(product), // ใช้ Helper เลือกรูป
        size: size,
        qty: 1
    };

    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    checkAuthUI(); // อัปเดตตัวเลข
    showToast(`Added ${product.name} to bag`);
    setTimeout(() => window.location.href = 'cart.html', 500);
}

// จัดการที่อยู่ (Address Manager)
const AddressMgr = {
    getAll: () => JSON.parse(localStorage.getItem('my_addresses') || '[]'),
    save: (name, tel, addr) => {
        let list = AddressMgr.getAll();
        if(!list.some(a => a.name === name && a.addr === addr)) {
            list.unshift({ name, tel, addr });
            localStorage.setItem('my_addresses', JSON.stringify(list.slice(0, 5)));
        }
    },
    loadSelect: (selectId) => {
        const select = document.getElementById(selectId);
        if(!select) return;
        const list = AddressMgr.getAll();
        select.innerHTML = '<option value="">-- Load Saved Address --</option>' + 
            list.map((a, i) => `<option value="${i}">${a.name} (${a.tel})</option>`).join('');
    },
    fillForm: (idx) => {
        if(idx === "") return;
        const data = AddressMgr.getAll()[idx];
        if(data) {
            document.getElementById('c-name').value = data.name;
            document.getElementById('c-tel').value = data.tel;
            document.getElementById('c-addr').value = data.addr;
        }
    }
};

/* =========================================
   INIT (ทำงานเมื่อโหลดหน้า)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    checkAuthUI();
    
    // หน้าแรก (Home)
    if (document.getElementById('product-list') && !window.location.href.includes('admin')) {
        fetchProducts('product-list');
    }

    // หน้าตะกร้า (Cart)
    if (window.location.href.includes('cart.html')) {
        AddressMgr.loadSelect('addr-select');
    }
});