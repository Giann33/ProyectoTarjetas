// /public/JS/auth.js
export function getToken() {
    return localStorage.getItem('token'); // opcional (puede no existir)
}

export function getUser() {
    const u = localStorage.getItem('user');
    try { return u ? JSON.parse(u) : null; } catch { return null; }
}

export function isLoggedIn() {
    // válido si hay token o al menos hay user guardado
    return !!getToken() || !!getUser();
}

// hoy NO hay /api/me; desactívalo por defecto
export async function verifyToken(apiBase = 'http://localhost:8081') {
    const t = getToken();
    if (!t) return true; // <- permite pasar sin token
    try {
        const r = await fetch(`${apiBase}/api/me`, { headers: { Authorization: `Bearer ${t}` } });
        return r.ok;
    } catch { return false; }
}

export async function requireAuth({ validateWithServer = false, apiBase = 'http://localhost:8081' } = {}) {
    if (!isLoggedIn()) {
        window.location.replace('/');
        return false;
    }
    if (validateWithServer) {
        const ok = await verifyToken(apiBase);
        if (!ok) {
            logout();
            window.location.replace('/');
            return false;
        }
    }
    return true;
}

export function authFetch(url, options = {}) {
    const t = getToken();
    const headers = Object.assign({}, options.headers || {}, t ? { Authorization: `Bearer ${t}` } : {});
    return fetch(url, {...options, headers });
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}