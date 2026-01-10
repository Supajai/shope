/* public/js/admin.js */

document.addEventListener('DOMContentLoaded', () => {
    // เช็คสิทธิ์ Admin
    if(localStorage.getItem('role') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    fetchAdminProducts();
    loadOrders();
    
    // ตั้งค่า Image Preview
    const imgInput = document.getElementById('p-img-file');
    if(imgInput) imgInput.addEventListener('change', function() {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '';
        if(this.files) Array.from(this.files).forEach(f => {
            const r = new FileReader();
            r.onload = e => { const i = document.createElement('img'); i.src=e.target.result; i.className='w-12 h-12 object-cover rounded border'; preview.appendChild(i); };
            r.readAsDataURL(f);
        });
    });

    // Form Submits
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    document.getElementById('edit-product-form').addEventListener('submit', handleEditSubmit);
});

// 1. ดึงออเดอร์
async function loadOrders() {
    try {
        const res = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const orders = await res.json();
        const container = document.getElementById('order-list');
        
        if(!orders || orders.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400">No orders found.</td></tr>`;
            return;
        }

        container.innerHTML = orders.map(o => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="p-4">
                    <div class="font-bold text-sm text-slate-800">${o.customerName}</div>
                    <div class="text-xs text-gray-500">${o.tel}</div>
                </td>
                <td class="p-4 text-xs text-gray-600">
                    ${o.items.map(i => `<div>${i.qty}x ${i.name}</div>`).join('')}
                </td>
                <td class="p-4 font-mono font-bold text-sm">${money(o.totalPrice)}</td>
                <td class="p-4">
                    <select onchange="updateOrderStatus('${o._id}', this.value)" class="p-1 rounded text-xs border bg-white">
                        <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
                        <option value="paid" ${o.status==='paid'?'selected':''}>Paid</option>
                        <option value="shipped" ${o.status==='shipped'?'selected':''}>Shipped</option>
                    </select>
                </td>
                <td class="p-4 text-center">
                    ${o.slipImage ? `<a href="${o.slipImage}" target="_blank" class="text-blue-600 font-bold text-xs underline">VIEW</a>` : '-'}
                </td>
            </tr>
        `).join('');
    } catch(e) { console.error(e); }
}

async function updateOrderStatus(id, status) {
    try {
        await fetch(`/api/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({status})
        });
        showToast('Status Updated');
    } catch(e) { showToast('Error', 'error'); }
}

// 2. ดึงสินค้า
window.allProductsCache = [];
async function fetchAdminProducts() {
    try {
        const res = await fetch('/api/products');
        const products = await res.json();
        window.allProductsCache = products;
        const container = document.getElementById('product-list');

        if(products.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="p-4 text-center">No products.</td></tr>`;
            return;
        }

        container.innerHTML = products.map(p => {
            const img = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/60';
            const statusColor = p.inStock ? 'text-green-600' : 'text-red-500';
            const statusText = p.inStock ? 'IN STOCK' : 'OUT STOCK';

            return `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="p-4 flex gap-3 items-center">
                    <img src="${img}" class="w-10 h-10 object-cover rounded border">
                    <span class="font-bold text-sm">${p.name}</span>
                </td>
                <td class="p-4 text-xs font-bold uppercase text-gray-500">${p.brand}</td>
                <td class="p-4 font-mono font-bold text-sm">
                    ${money(p.price)} <br> <span class="text-[10px] ${statusColor}">${statusText}</span>
                </td>
                <td class="p-4 text-right">
                    <button onclick="openEditModal('${p._id}')" class="text-blue-600 font-bold text-xs mr-2">EDIT</button>
                    <button onclick="deleteProduct('${p._id}')" class="text-red-600 font-bold text-xs">DEL</button>
                </td>
            </tr>`;
        }).join('');
    } catch(e) { console.error(e); }
}

// 3. เพิ่มสินค้า
async function handleAddProduct(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = 'Adding...'; btn.disabled = true;

    const form = e.target;
    const formData = new FormData();
    formData.append('name', form.name.value);
    formData.append('brand', form.brand.value);
    formData.append('category', form.category.value);
    formData.append('price', form.price.value);
    formData.append('description', form.description.value);
    formData.append('sizes', form.sizes.value);
    formData.append('stock', form.stock.value); // ส่งค่า "true"/"false"

    const fileInput = document.getElementById('p-img-file');
    for(let i=0; i<fileInput.files.length; i++) formData.append('images', fileInput.files[i]);

    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if(res.ok) { 
            showToast('Product Added!'); 
            form.reset(); 
            document.getElementById('image-preview').innerHTML = '';
            fetchAdminProducts(); 
        } else { showToast('Failed', 'error'); }
    } catch(e) { showToast('Error', 'error'); }
    finally { btn.innerText = 'Add Product'; btn.disabled = false; }
}

// ... (ส่วน Edit และ Delete ใช้ Logic เดิม หรือให้ผมเขียนเพิ่มให้ก็ได้ครับ) ...
// เพื่อความชัวร์ เพิ่ม openEditModal และ deleteProduct ต่อท้ายไฟล์นี้ได้เลยครับ
function openEditModal(id) {
    const p = window.allProductsCache.find(x => x._id === id);
    if(!p) return;
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = p.name;
    document.getElementById('edit-brand').value = p.brand;
    document.getElementById('edit-category').value = p.category || 'other';
    document.getElementById('edit-price').value = p.price;
    document.getElementById('edit-description').value = p.description;
    document.getElementById('edit-sizes').value = p.sizes ? p.sizes.join(',') : '';
    document.getElementById('edit-stock').value = p.inStock ? 'true' : 'false'; // ตั้งค่า Dropdown
    document.getElementById('edit-modal').classList.add('active');
}

async function handleEditSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const formData = new FormData();
    // Append fields like Add Product...
    formData.append('name', document.getElementById('edit-name').value);
    formData.append('brand', document.getElementById('edit-brand').value);
    formData.append('category', document.getElementById('edit-category').value);
    formData.append('price', document.getElementById('edit-price').value);
    formData.append('description', document.getElementById('edit-description').value);
    formData.append('sizes', document.getElementById('edit-sizes').value);
    formData.append('stock', document.getElementById('edit-stock').value);
    
    const fileInput = document.getElementById('edit-img-file');
    for(let i=0; i<fileInput.files.length; i++) formData.append('images', fileInput.files[i]);

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if(res.ok) { 
            showToast('Updated!'); 
            document.getElementById('edit-modal').classList.remove('active'); 
            fetchAdminProducts(); 
        }
    } catch(e) { showToast('Error', 'error'); }
}

async function deleteProduct(id) {
    if(!confirm('Delete?')) return;
    try {
        const res = await fetch(`/api/products/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if(res.ok) { showToast('Deleted'); fetchAdminProducts(); }
    } catch(e) { showToast('Error', 'error'); }
}