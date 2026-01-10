function checkAuthUI() {
    const user = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const authDiv = document.getElementById('auth-menu');
    const cartBadge = document.getElementById('cart-badge');

    // อัปเดตตัวเลขในตะกร้า
    if(cartBadge) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartBadge.innerText = cart.length;
    }

    if (authDiv) {
        if (user) {
            authDiv.innerHTML = `
                <span>สวัสดี, ${user}</span>
                ${role === 'admin' ? '<a href="admin.html" style="color:red; margin:0 10px;">[ADMIN]</a>' : ''}
                <button onclick="logout()">ออกจากระบบ</button>
            `;
        } else {
            authDiv.innerHTML = `<a href="login.html">เข้าสู่ระบบ</a> | <a href="register.html">สมัครสมาชิก</a>`;
        }
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}