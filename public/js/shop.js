/* public/js/shop.js */

let currentFilters = {
    category: 'all', brand: [], minPrice: '', maxPrice: '', search: '', sort: 'newest'
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuthUI();
    triggerSearch(); 

    const inputs = ['search-input', 'search-mobile'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') triggerSearch();
            });
        }
    });
});

window.triggerSearch = async function() {
    const container = document.getElementById('product-list');
    const loading = document.getElementById('loading');
    const count = document.getElementById('product-count');
    
    const selectedCat = document.querySelector('input[name="cat"]:checked')?.value || 'all';
    const selectedBrands = Array.from(document.querySelectorAll('.brand-chk:checked')).map(cb => cb.value);
    const minPrice = document.getElementById('min-price')?.value || '';
    const maxPrice = document.getElementById('max-price')?.value || '';
    const sortVal = document.getElementById('sort-select')?.value || 'newest';
    
    const searchDesktop = document.getElementById('search-input')?.value.trim();
    const searchMobile = document.getElementById('search-mobile')?.value.trim();
    const searchText = searchDesktop || searchMobile || '';

    const params = new URLSearchParams();
    if(selectedCat !== 'all') params.append('category', selectedCat);
    if(selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
    if(minPrice) params.append('minPrice', minPrice);
    if(maxPrice) params.append('maxPrice', maxPrice);
    if(searchText) params.append('search', searchText);
    params.append('sort', sortVal);

    if(container) container.innerHTML = '';
    if(loading) loading.classList.remove('hidden');
    if(count) count.innerText = '...';

    try {
        const res = await fetch(`${API_URL}/products?${params.toString()}`);
        const products = await res.json();
        
        if(loading) loading.classList.add('hidden');
        if(count) count.innerText = products.length;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-300">
                    <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <p class="text-sm font-bold uppercase tracking-widest">No Matches Found</p>
                </div>`;
            return;
        }

        container.innerHTML = products.map((p, index) => {
            const img = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/400';
            const safeName = p.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const delay = index * 50;
            
            return `
            <div class="group relative fade-in" style="animation-delay: ${delay}ms">
                <a href="product.html?id=${p._id}" class="block">
                    <div class="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-4 rounded-lg">
                        <img src="${img}" class="w-full h-full object-cover transition duration-700 group-hover:scale-105 group-hover:contrast-105 ${!p.inStock ? 'grayscale opacity-70' : ''}">
                        
                        ${!p.inStock ? 
                            '<div class="absolute inset-0 flex items-center justify-center bg-black/20"><span class="bg-red-600 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest transform -rotate-12 border-2 border-white">Sold Out</span></div>' 
                            : ''}
                        
                        <div class="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition duration-300">
                            <button class="w-full bg-white text-black font-bold text-[10px] py-3 uppercase tracking-widest hover:bg-black hover:text-white transition shadow-lg">View Details</button>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between items-start mb-1">
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">${p.brand}</p>
                            <p class="text-[10px] font-bold text-gray-300 uppercase">${p.category}</p>
                        </div>
                        <h3 class="font-bold text-sm text-slate-900 truncate mb-1 group-hover:text-red-600 transition">${p.name}</h3>
                        <p class="font-mono text-sm font-bold">${money(p.price)}</p>
                    </div>
                </a>
                
                </div>`;
        }).join('');

    } catch (e) {
        console.error(e);
        loading.innerHTML = '<p class="text-red-500">Error loading data.</p>';
    }
}

// ยังเก็บฟังก์ชันนี้ไว้เผื่อใช้ในหน้า product.html
window.addToCart = function(id, name, price, image, e) {
    if(e) { e.preventDefault(); e.stopPropagation(); }
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const defaultSize = '-'; 
    const existingIndex = cart.findIndex(i => i.id === id && i.size === defaultSize);
    
    if(existingIndex > -1) { cart[existingIndex].qty += 1; } 
    else { cart.push({ id, name, price: Number(price), image, size: defaultSize, qty: 1 }); }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    checkAuthUI(); 
    if(typeof showToast === 'function') showToast(`Added ${name} to bag`);
    else alert(`Added ${name} to bag`);
};