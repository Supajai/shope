/* public/js/cart.js */

document.addEventListener('DOMContentLoaded', () => {
    checkAuthUI();
    renderCart();
    
    // ตรวจสอบว่าหน้าเว็บมีฟอร์ม order-form หรือไม่
    const orderForm = document.getElementById('order-form');
    if(orderForm) {
        orderForm.addEventListener('submit', submitOrder);
    }
});

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-price');
    const subtotalEl = document.getElementById('subtotal-price');
    const countEl = document.getElementById('item-count');
    const btn = document.querySelector('button[type="submit"]');

    if (!container) return; 

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 flex flex-col items-center justify-center opacity-50">
                <p class="text-sm font-bold uppercase tracking-widest text-gray-400">Bag is Empty</p>
                <a href="index.html" class="mt-4 text-xs font-bold text-black border-b border-black pb-0.5 hover:text-red-600 transition">Go Shopping</a>
            </div>`;
        if(totalEl) totalEl.innerText = '฿0';
        if(subtotalEl) subtotalEl.innerText = '฿0';
        if(countEl) countEl.innerText = '0 items';
        if(btn) { btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); }
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        total += item.price * item.qty;
        const img = item.image || 'https://via.placeholder.com/100';

        return `
        <div class="flex gap-4 group mb-4">
            <div class="w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg p-2 flex-shrink-0">
                <img src="${img}" class="w-full h-full object-contain">
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <h4 class="font-bold text-sm text-slate-900 uppercase line-clamp-1">${item.name}</h4>
                    <button onclick="removeFromCart(${index})" class="text-xs text-red-500 font-bold hover:underline">REMOVE</button>
                </div>
                <p class="text-xs text-gray-500">Qty: ${item.qty}</p>
                <p class="font-mono font-bold text-sm text-black">${money(item.price)}</p>
            </div>
        </div>`;
    }).join('');

    if(totalEl) totalEl.innerText = money(total);
    if(subtotalEl) subtotalEl.innerText = money(total);
    if(countEl) countEl.innerText = `${cart.length} ITEMS`;
    if(btn) { btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    checkAuthUI();
}

async function submitOrder(e) {
    e.preventDefault();
    
    // เช็ค Login
    const token = localStorage.getItem('token');
    if(!token) {
        showAlert('Login Required', 'Please login to place an order.', 'error', () => {
            window.location.href = 'login.html';
        });
        return;
    }

    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    
    // ล็อกปุ่มกันกดซ้ำ
    btn.innerText = 'Processing...'; 
    btn.disabled = true;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if(cart.length === 0) {
        showAlert('Cart Empty', 'Please add items first.', 'error');
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // ✅ ใช้ FormData เพื่อส่งไฟล์และข้อมูล
    const formData = new FormData();
    formData.append('customerName', form.name.value);
    formData.append('tel', form.tel.value);
    formData.append('address', form.address.value);
    formData.append('totalPrice', totalPrice);

    // แปลงรายการสินค้าเป็น JSON String (เพราะ FormData ส่ง Array ตรงๆ ไม่ได้)
    const itemsData = cart.map(i => ({
        name: i.name,
        price: i.price,
        qty: i.qty,
        size: i.size || '',
        image: i.image || ''
    }));
    formData.append('items', JSON.stringify(itemsData));

    // แนบไฟล์สลิป (ถ้ามี)
    const fileInput = form.querySelector('input[name="slipImage"]');
    if (fileInput && fileInput.files.length > 0) {
        formData.append('slipImage', fileInput.files[0]);
    }

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            // ✅ สำคัญ: ส่ง true เพื่อบอกว่าไม่ต้องใส่ application/json
            headers: getHeaders(true), 
            body: formData
        });

        const data = await res.json();

        if(res.ok) {
            localStorage.removeItem('cart');
            showAlert('Order Placed!', 'Thank you for shopping with us.', 'success', () => {
                window.location.href = 'index.html';
            });
        } else {
            showAlert('Order Failed', data.message || 'Something went wrong.', 'error');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch(err) {
        console.error(err);
        showAlert('Network Error', 'Cannot connect to server.', 'error');
        btn.innerText = originalText;
        btn.disabled = false;
    }
}