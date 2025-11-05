// Frontend/public/JS/login.js
const API_BASE = 'http://localhost:8081';

const form = document.getElementById('loginForm');
form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const correo = e.target.correo.value.trim();
    const password = e.target.password.value;

    try {
        const r = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });

        if (!r.ok) {
            const txt = await r.text().catch(() => '');
            alert('Credenciales inválidas' + (txt ? `: ${txt}` : ''));
            return;
        }

        // Backend devuelve: { idUsuario, nombre, correo, status }
        const data = await r.json();
        localStorage.setItem('user', JSON.stringify(data));

        // Redirige al dashboard
        window.location.href = '/dashboard.html';
    } catch (err) {
        console.error(err);
        alert('No se pudo conectar con el servidor.');
    }
});