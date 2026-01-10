/* public/js/auth.js */
function checkAuthUI() {
    const token = localStorage.getItem('token');
    const authMenu = document.getElementById('auth-menu');
    const cartBadge = document.getElementById('cart-badge');

    // Cart Count
    if(cartBadge) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum, i) => sum + i.qty, 0);
        cartBadge.innerText = count;
        if(count === 0) cartBadge.classList.add('hidden');
        else cartBadge.classList.remove('hidden');
    }

    // Login/Logout Menu
    if (authMenu) {
        if (token) {
            authMenu.innerHTML = `
                <div class="flex items-center gap-4">
                    <span class="text-xs font-bold">WELCOME</span>
                    <button onclick="logout()" class="text-red-600 font-bold hover:underline">LOGOUT</button>
                </div>
            `;
        } else {
            authMenu.innerHTML = `
                <a href="login.html" class="flex items-center gap-2 hover:text-red-600 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                    LOGIN
                </a>`;
        }
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}