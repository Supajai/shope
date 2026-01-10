 document.addEventListener('DOMContentLoaded', () => {
    checkAuthUI();

    // เช็คว่าหน้าปัจจุบันมีตารางสินค้าหรือไม่ (เช่น admin.html)
    if(document.getElementById('product-list')) {
        const isAdmin = window.location.pathname.includes('admin.html');
        fetchProducts('product-list', isAdmin);
    }

    // ⚠️ ผูก Event การเพิ่มสินค้า
    const addForm = document.getElementById('add-product-form');
    if(addForm) {
        addForm.addEventListener('submit', addProduct);
        
        // ผูก Event Preview รูป
        const imgInput = document.getElementById('product-images');
        if(imgInput) {
            imgInput.addEventListener('change', function() {
                handleImagePreview(this, 'image-preview');
            });
        }
    }

    // ⚠️ ผูก Event การแก้ไขสินค้า
    const editForm = document.getElementById('edit-product-form');
    if(editForm) {
        editForm.addEventListener('submit', submitEdit);
    }
});