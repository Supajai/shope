/* public/js/config.js */

const API_URL = '/api';
const money = (num) => '฿' + Number(num).toLocaleString();

// ✅ แก้ไข: เพิ่มพารามิเตอร์ isMultipart เพื่อเช็คว่าส่งไฟล์หรือไม่
function getHeaders(isMultipart = false) {
    const token = localStorage.getItem('token');
    const headers = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // ⚠️ ถ้าไม่ใช่การส่งไฟล์ (isMultipart = false) ให้ใช้ JSON เหมือนเดิม
    // แต่ถ้าส่งไฟล์ (isMultipart = true) ให้ Browser จัดการเอง (ห้ามใส่ Content-Type)
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
}

// ฟังก์ชันแจ้งเตือน (Popup สวยๆ)
window.showAlert = function(title, message, type = 'success', callback = null) {
    const oldAlert = document.getElementById('custom-alert-modal');
    if(oldAlert) oldAlert.remove();

    const isError = type === 'error';
    const iconColor = isError ? 'text-red-500' : 'text-green-500';
    const btnColor = isError ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800';
    
    const iconCheck = `<svg class="w-12 h-12 mx-auto mb-4 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    const iconError = `<svg class="w-12 h-12 mx-auto mb-4 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

    const modalHTML = `
        <div id="custom-alert-modal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300">
            <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-[90%] text-center transform scale-90 transition-transform duration-300">
                ${isError ? iconError : iconCheck}
                <h3 class="text-2xl font-black uppercase mb-2 font-anton tracking-wide text-black">${title}</h3>
                <p class="text-gray-500 mb-6 text-sm font-medium leading-relaxed">${message}</p>
                <button id="alert-close-btn" class="w-full ${btnColor} text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition shadow-lg transform active:scale-95">
                    Okay
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    setTimeout(() => {
        const el = document.getElementById('custom-alert-modal');
        if(el) {
            el.classList.remove('opacity-0');
            el.querySelector('div').classList.remove('scale-90');
            el.querySelector('div').classList.add('scale-100');
        }
    }, 10);

    const closeBtn = document.getElementById('alert-close-btn');
    if(closeBtn) {
        closeBtn.onclick = () => {
            const el = document.getElementById('custom-alert-modal');
            el.classList.add('opacity-0');
            el.querySelector('div').classList.add('scale-90');
            setTimeout(() => {
                el.remove();
                if(callback) callback();
            }, 300);
        };
    }
};

window.showToast = (msg, type) => window.showAlert(type === 'error' ? 'Oops!' : 'Success', msg, type);