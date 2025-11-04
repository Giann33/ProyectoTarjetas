// /public/JS/auth.js
export function getToken() {
    return localStorage.getItem('token');
}

export function isLoggedIn() {
    const t = getToken();
    return !!t;
}

// Si necesitas validar contra el backend (opcional)
export async function verifyToken(apiBase = 'http://localhost:8081') {
    const t = getToken();
    if (!t) return false;
    try {
        const r = await fetch(`${apiBase}/api/me`, {
            headers: { Authorization: `Bearer ${t}` }
        });
        return r.ok;
    } catch {
        return false;
    }
}

// Redirige a login si no hay token (y opcionalmente valida contra backend)
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

// Helper para fetch con Bearer
export function authFetch(url, options = {}) {
    const t = getToken();
    const headers = Object.assign({}, options.headers || {}, t ? { Authorization: `Bearer ${t}` } : {});
    return fetch(url, {...options, headers });
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}