/* ========================
   FETCH PRODUCTS
   ======================== */
async function fetchProducts(containerId, isAdmin = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        window.allProductsCache = products;

        if (products.length === 0) {
            container.innerHTML = '<tr><td colspan="6" class="p-4 text-center">No products found</td></tr>';
            return;
        }

        container.innerHTML = products.map(p => {
            const img = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'https://via.placeholder.com/150');
            const sizesDisplay = (p.sizes && p.sizes.length > 0) ? p.sizes.join(', ') : '-';

            if (isAdmin) {
                return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-3"><img src="${img}" class="w-12 h-12 object-cover rounded border bg-white"></td>
                    <td class="p-3 font-medium">${p.name} <span class="text-xs text-gray-400 block">${p.brand || ''}</span></td>
                    <td class="p-3">${money(p.price)}</td>
                    <td class="p-3 text-sm">${sizesDisplay}</td>
                    <td class="p-3">
                        <span class="px-2 py-1 text-[10px] uppercase font-bold rounded ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                            ${p.inStock ? 'In Stock' : 'Out'}
                        </span>
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="openEditModal('${p._id}')" class="text-blue-600 hover:underline mr-2 text-sm">Edit</button>
                        <button onclick="deleteProduct('${p._id}')" class="text-red-600 hover:underline text-sm">Del</button>
                    </td>
                </tr>`;
            } else {
                // ส่วน User Card (หน้า Index)
                return `
                <div class="bg-white p-4 rounded-lg shadow hover:shadow-xl transition duration-300">
                    <img src="${img}" class="w-full h-48 object-cover mb-4 rounded-md">
                    <h3 class="font-bold text-lg truncate">${p.name}</h3>
                    <p class="text-gray-500 text-sm mb-1">${p.brand || ''}</p>
                    <div class="flex justify-between items-center mt-2">
                        <span class="font-mono font-bold text-lg">${money(p.price)}</span>
                        <button onclick="addToCart('${p._id}', '${p.name}', ${p.price})" class="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800">Add</button>
                    </div>
                </div>`;
            }
        }).join('');
    } catch(e) { console.error(e); }
}

/* ========================
   ADD PRODUCT
   ======================== */
async function addProduct(e) {
    e.preventDefault(); // ⚠️ ป้องกันเว็บรีเฟรชเอง
    
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    btn.innerText = 'Saving...'; btn.disabled = true;

    const formData = new FormData();
    formData.append('name', form.name.value);
    formData.append('brand', form.brand.value);
    formData.append('price', form.price.value);
    formData.append('sizes', form.sizes.value); // ส่งค่า size
    formData.append('stock', form.stock.value);

    // ดึงไฟล์จาก input id="product-images"
    const fileInput = document.getElementById('product-images');
    if (fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('images', fileInput.files[i]);
        }
    }

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // ไม่ใส่ Content-Type
            body: formData
        });

        if (res.ok) {
            alert('✅ Product Added!');
            window.location.reload();
        } else {
            const data = await res.json();
            alert('❌ Error: ' + (data.message || data.error));
            btn.innerText = 'Add Product'; btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert('❌ Connection Failed');
        btn.innerText = 'Add Product'; btn.disabled = false;
    }
}

/* ========================
   EDIT & DELETE
   ======================== */
function openEditModal(id) {
    const product = window.allProductsCache.find(p => p._id === id);
    if (!product) return;

    document.getElementById('edit-id').value = product._id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-stock').value = product.inStock;
    document.getElementById('edit-sizes').value = product.sizes ? product.sizes.join(', ') : '';
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

async function submitEdit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const formData = new FormData();

    formData.append('name', document.getElementById('edit-name').value);
    formData.append('price', document.getElementById('edit-price').value);
    formData.append('stock', document.getElementById('edit-stock').value);
    formData.append('sizes', document.getElementById('edit-sizes').value);

    const fileInput = document.getElementById('edit-images');
    if (fileInput.files.length > 0) {
        for(let i=0; i<fileInput.files.length; i++){
            formData.append('images', fileInput.files[i]);
        }
    }

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            alert('✅ Updated!');
            window.location.reload();
        } else {
            alert('❌ Update Failed');
        }
    } catch(err) { console.error(err); }
}

async function deleteProduct(id) {
    if(!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    window.location.reload();
}

// Preview Image Logic
function handleImagePreview(input, previewId) {
    const box = document.getElementById(previewId);
    if(!box || !input.files) return;
    box.innerHTML = '';
    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'w-20 h-20 object-cover rounded shadow';
            box.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}