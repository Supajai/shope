/* public/js/admin.js */

// ตัวแปร allProducts จะถูกใช้ร่วมกับหน้าอื่นๆ ถ้ามีการโหลด products.js
let adminProducts = []; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. เช็คสิทธิ์ Admin (ใช้ฟังก์ชันจาก auth.js หรือเช็คเองก็ได้)
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
        alert('Access Denied: Admins Only');
        window.location.href = 'index.html';
        return;
    }

    // 2. โหลดข้อมูล
    loadOrders();
    fetchAdminProducts(); // ฟังก์ชันในไฟล์นี้

    // 3. Setup Image Preview
    const imgInput = document.getElementById('p-img-file');
    if(imgInput) {
        imgInput.addEventListener('change', function(e) {
            const preview = document.getElementById('image-preview');
            preview.innerHTML = '';
            Array.from(this.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const img = document.createElement('img');
                    img.src = evt.target.result;
                    img.className = 'w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0';
                    preview.appendChild(img);
                }
                reader.readAsDataURL(file);
            });
        });
    }

    // 4. Handle Form
    const pForm = document.getElementById('product-form');
    if(pForm) pForm.addEventListener('submit', handleProductSubmit);
});

// --- MENU FUNCTIONS ---
window.switchTab = (tab) => {
    document.getElementById('tab-orders').classList.toggle('hidden', tab !== 'orders');
    document.getElementById('tab-products').classList.toggle('hidden', tab !== 'products');
    
    // Toggle Button Style
    const btnO = document.getElementById('btn-orders');
    const btnP = document.getElementById('btn-products');
    const active = "bg-red-600 text-white shadow-lg";
    const inactive = "text-slate-400 hover:bg-slate-800 hover:text-white";

    if(tab === 'orders') {
        btnO.className = `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${active}`;
        btnP.className = `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${inactive}`;
        loadOrders();
    } else {
        btnP.className = `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${active}`;
        btnO.className = `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${inactive}`;
        fetchAdminProducts();
    }

    if(window.innerWidth < 768) toggleSidebar();
};

window.toggleSidebar = () => {
    const sb = document.getElementById('sidebar');
    const bd = document.getElementById('sidebar-backdrop');
    const isClosed = sb.classList.contains('-translate-x-full');
    
    if(isClosed) {
        sb.classList.remove('-translate-x-full');
        bd.classList.remove('hidden');
    } else {
        sb.classList.add('-translate-x-full');
        bd.classList.add('hidden');
    }
};

// --- ORDERS ---
async function loadOrders() {
    const container = document.getElementById('order-list');
    try {
        // ใช้ API_URL จาก config.js และ getHeaders จาก utils.js
        const res = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
        const orders = await res.json();

        if (!orders || orders.length === 0) {
            container.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-gray-400">No orders found.</td></tr>`;
            return;
        }

        container.innerHTML = orders.map(o => {
            const itemsList = (o.items || []).map(i => 
                `<div class="flex items-center gap-2 mb-1">
                    <span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded">${i.qty}x</span>
                    <span class="truncate w-32 font-medium text-slate-700">${i.name}</span>
                 </div>`
            ).join('');

            let statusStyle = 'bg-gray-100 text-gray-600';
            if(o.status === 'paid') statusStyle = 'bg-green-100 text-green-700 border border-green-200';
            if(o.status === 'shipped') statusStyle = 'bg-blue-100 text-blue-700 border border-blue-200';

            // ใช้ money() จาก utils.js
            return `
            <tr class="hover:bg-gray-50 border-b border-gray-100 transition">
                <td class="px-6 py-4 align-top">
                    <p class="font-bold text-slate-900 text-sm">${o.customerName}</p>
                    <p class="text-xs text-gray-500 font-mono mt-0.5">${o.tel}</p>
                    <p class="text-[10px] text-gray-400 mt-1 truncate max-w-[150px]">${o.address}</p>
                </td>
                <td class="px-6 py-4 align-top text-xs">${itemsList}</td>
                <td class="px-6 py-4 align-top font-mono font-bold text-sm">${money(o.totalPrice)}</td>
                <td class="px-6 py-4 align-top">
                    <select onchange="updateOrderStatus('${o._id}', this.value)" class="text-xs uppercase font-bold py-1 px-2 rounded cursor-pointer outline-none ${statusStyle}">
                        <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
                        <option value="paid" ${o.status==='paid'?'selected':''}>Paid</option>
                        <option value="shipped" ${o.status==='shipped'?'selected':''}>Shipped</option>
                    </select>
                </td>
                <td class="px-6 py-4 align-top text-center">
                    ${o.slipImage ? `<a href="${o.slipImage}" target="_blank" class="text-[10px] font-bold bg-slate-900 text-white px-3 py-1 rounded-full hover:bg-black transition">VIEW</a>` : '-'}
                </td>
                <td class="px-6 py-4 align-top text-right text-xs text-gray-400">
                    ${new Date(o.createdAt).toLocaleDateString()}
                </td>
            </tr>`;
        }).join('');

    } catch(e) { 
        console.error(e);
        container.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-red-500">Error loading orders</td></tr>`; 
    }
}

window.updateOrderStatus = async (id, status) => {
    try {
        const res = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({status})
        });
        if(res.ok) {
            if(typeof showToast === 'function') showToast(`Order updated to ${status}`);
            else alert(`Order updated to ${status}`);
            loadOrders();
        }
    } catch(e) { alert('Error updating'); }
};

// --- PRODUCTS ---
async function fetchAdminProducts() {
    const container = document.getElementById('product-list');
    try {
        const res = await fetch(`${API_URL}/products`);
        adminProducts = await res.json(); // เก็บไว้ในตัวแปร local ของไฟล์นี้

        if (adminProducts.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-400">No products found.</td></tr>`;
            return;
        }

        container.innerHTML = adminProducts.map(p => {
            const img = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/60';
            const stockBadge = p.inStock 
                ? '<span class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">In Stock</span>' 
                : '<span class="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Out Stock</span>';

            return `
            <tr class="hover:bg-gray-50 border-b border-gray-100 transition">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <img src="${img}" class="w-12 h-12 rounded object-cover border border-gray-200 bg-gray-100">
                        <div>
                            <p class="font-bold text-sm text-slate-900 line-clamp-1">${p.name}</p>
                            <p class="text-[10px] text-gray-400 uppercase tracking-wide">${p.brand} • ${p.category}</p>
                            <p class="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">${p.description || ''}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 font-mono font-bold text-sm">${money(p.price)}</td>
                <td class="px-6 py-4 text-xs text-gray-500 max-w-[150px] truncate">${p.sizes.join(', ') || '-'}</td>
                <td class="px-6 py-4">${stockBadge}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="openModal('${p._id}')" class="text-blue-600 hover:bg-blue-50 p-2 rounded transition"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProduct('${p._id}')" class="text-red-500 hover:bg-red-50 p-2 rounded transition ml-1"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    } catch(e) { console.error(e); }
}

// --- MODAL & FORM ---
window.openModal = (id = null) => {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    const preview = document.getElementById('image-preview');

    modal.classList.remove('hidden');
    preview.innerHTML = '';
    
    if (id) {
        // Edit Mode
        const p = adminProducts.find(x => x._id === id);
        title.innerText = 'Edit Product';
        document.getElementById('edit-id').value = id;
        
        form.name.value = p.name;
        form.brand.value = p.brand;
        form.category.value = p.category;
        form.price.value = p.price;
        form.description.value = p.description || '';
        form.sizes.value = p.sizes.join(', ');
        document.getElementById('edit-stock').value = p.inStock.toString();
        
        if(p.images) {
            p.images.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.className = 'w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0';
                preview.appendChild(img);
            });
        }
    } else {
        // Add Mode
        title.innerText = 'Add New Product';
        document.getElementById('edit-id').value = '';
        form.reset();
        document.getElementById('edit-stock').value = 'true';
    }
};

window.closeModal = () => document.getElementById('product-modal').classList.add('hidden');

async function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    
    btn.disabled = true;
    btn.innerText = 'Saving...';

    const formData = new FormData();
    formData.append('name', form.name.value);
    formData.append('brand', form.brand.value);
    formData.append('category', form.category.value);
    formData.append('price', form.price.value);
    formData.append('description', form.description.value);
    formData.append('sizes', form.sizes.value);
    formData.append('stock', document.getElementById('edit-stock').value);

    const fileInput = document.getElementById('p-img-file');
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images', fileInput.files[i]);
    }

    try {
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
        const method = id ? 'PUT' : 'POST';

        // ใช้ getHeaders(true) สำหรับ FormData
        const res = await fetch(url, {
            method: method,
            headers: getHeaders(true),
            body: formData
        });

        if (res.ok) {
            if(typeof showToast === 'function') showToast(id ? 'Product Updated' : 'Product Added');
            else alert('Saved successfully');
            
            closeModal();
            fetchAdminProducts();
        } else {
            alert('Failed to save');
        }
    } catch (err) {
        alert('Network error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Save Product';
    }
}

window.deleteProduct = async (id) => {
    if(!confirm('Delete this product?')) return;
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if(res.ok) {
            if(typeof showToast === 'function') showToast('Deleted');
            else alert('Deleted');
            fetchAdminProducts();
        }
    } catch(e) { alert('Error deleting'); }
};