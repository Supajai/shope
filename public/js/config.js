const API_URL = '/api';
const money = (num) => '฿' + Number(num).toLocaleString();

function getHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    } : { 'Content-Type': 'application/json' };
}

function showToast(msg, type='success') {
    // โค้ดแสดงแจ้งเตือนง่ายๆ
    const div = document.createElement('div');
    div.innerText = msg;
    div.style.cssText = `position:fixed; top:20px; right:20px; background:${type==='error'?'red':'green'}; color:white; padding:10px 20px; border-radius:5px; z-index:9999;`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}