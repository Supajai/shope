/* public/js/profile.js */

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProfile();
    loadOrders();

    document.getElementById('profile-form').addEventListener('submit', updateProfile);
});

// ตรวจสอบ Login
function checkAuth() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }
}

// 1. ดึงข้อมูล Profile มาแสดง
async function loadProfile() {
    try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
        if (res.ok) {
            const user = await res.json();
            document.getElementById('p-name').value = user.fullName || '';
            document.getElementById('p-tel').value = user.tel || '';
            document.getElementById('p-addr').value = user.address || '';
        }
    } catch (e) { console.error('Load profile failed', e); }
}

// 2. บันทึกข้อมูล Profile
async function updateProfile(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = 'Saving...'; btn.disabled = true;

    const data = {
        fullName: document.getElementById('p-name').value,
        tel: document.getElementById('p-tel').value,
        address: document.getElementById('p-addr').value
    };

    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (res.ok) showToast('Profile Updated!');
        else showToast('Update Failed', 'error');
    } catch (e) { showToast('Error', 'error'); }
    finally { btn.innerText = 'Save Changes'; btn.disabled = false; }
}

// 3. ดึงประวัติการสั่งซื้อ (Order History)
async function loadOrders() {
    try {
        const res = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
        const orders = await res.json();
        const container = document.getElementById('order-list');

        if (orders.length === 0) {
            container.innerHTML = `<div class="text-center py-10 bg-white rounded-xl border border-gray-100"><p class="text-sm font-bold text-gray-400 uppercase">No orders found</p><a href="index.html" class="text-xs text-red-600 font-bold hover:underline mt-2 inline-block">Start Shopping</a></div>`;
            return;
        }

        container.innerHTML = orders.map(order => {
            const date = new Date(order.createdAt).toLocaleDateString('en-GB');
            // เลือกสีป้ายสถานะ
            let statusClass = 'bg-gray-100 text-gray-500';
            if (order.status === 'paid') statusClass = 'bg-yellow-100 text-yellow-700';
            if (order.status === 'shipped') statusClass = 'bg-green-100 text-green-700';

            return `
            <div class="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition group">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order ID</p>
                        <p class="font-mono text-xs font-bold text-slate-700 select-all">${order._id}</p>
                    </div>
                    <span class="${statusClass} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">${order.status}</span>
                </div>
                
                <div class="space-y-2 mb-4">
                    ${order.items.map(item => `
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600"><span class="font-bold text-black">${item.qty}x</span> ${item.name} <span class="text-xs text-gray-400">(${item.size})</span></span>
                            <span class="font-mono font-bold">${money(item.price)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="border-t border-gray-50 pt-4 flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase">Total Amount</p>
                        <p class="font-anton text-lg text-slate-900">${money(order.totalPrice)}</p>
                    </div>
                    
                    <button onclick='openTrackModal(${JSON.stringify(order)})' class="bg-black text-white px-6 py-2 rounded-lg font-bold uppercase text-[10px] hover:bg-red-600 transition shadow-lg transform active:scale-95 flex items-center gap-2">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        Track Status
                    </button>
                </div>
            </div>`;
        }).join('');

    } catch (e) { console.error('Load orders failed', e); }
}

// 4. เปิด Modal ติดตามพัสดุ
function openTrackModal(order) {
    const modal = document.getElementById('track-modal');
    document.getElementById('modal-oid').innerText = order._id;
    
    // Render Items inside modal
    const itemsHtml = order.items.map(i => 
        `<div class="flex justify-between border-b border-gray-100 pb-1 last:border-0"><span>${i.qty}x ${i.name}</span><span>${i.size}</span></div>`
    ).join('');
    document.getElementById('modal-items').innerHTML = itemsHtml;

    // Update Timeline Logic
    const steps = ['pending', 'paid', 'shipped'];
    const currentIndex = steps.indexOf(order.status);
    const progressLine = document.getElementById('progress-line');
    const stepEls = document.querySelectorAll('.step');

    // Reset
    progressLine.style.width = '0%';
    stepEls.forEach(el => {
        const circle = el.querySelector('div');
        const text = el.querySelector('span');
        circle.className = 'w-8 h-8 rounded-full bg-gray-200 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white transition-colors duration-500';
        circle.innerHTML = circle.innerText; // Reset icon if needed
        text.className = 'text-[9px] font-bold uppercase text-gray-400 transition-colors';
    });

    // Animate Progress
    setTimeout(() => {
        let width = 0;
        if (currentIndex === 1) width = 50;
        if (currentIndex === 2) width = 100;
        progressLine.style.width = width + '%';

        stepEls.forEach((el, idx) => {
            if (idx <= currentIndex) {
                const circle = el.querySelector('div');
                const text = el.querySelector('span');
                circle.classList.remove('bg-gray-200');
                circle.classList.add('bg-green-500'); // สีเขียวเมื่อผ่านแล้ว
                text.classList.remove('text-gray-400');
                text.classList.add('text-black');
            }
        });
    }, 100);

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('track-modal').classList.add('hidden');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
}