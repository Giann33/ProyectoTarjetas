// Frontend/public/JS/login.js
const API_BASE = 'http://localhost:8081';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#loginForm');
  const btn  = document.querySelector('#btn-login') || document.querySelector('button[type="submit"]');

  console.log('Listener de login ATTACHED', { formExists: !!form });

  // Diagnóstico: ver si el click llega
  btn?.addEventListener('click', () => console.log('CLICK submit'));

  form.addEventListener('submit', async (e) => {
    console.log('SUBMIT FIRED');   // <- si no ves esto, era validación nativa antes
    e.preventDefault();

    const correo   = document.querySelector('#correo')?.value?.trim() ?? '';
    const password = document.querySelector('#password')?.value ?? '';

    if (!correo || !password) {
      alert('Ingrese correo y contraseña');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      alert('Correo inválido');
      return;
    }

    try {
      const r = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        alert('Credenciales inválidas' + (txt ? `: ${txt}` : ''));
        return;
      }

      const data = await r.json();
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = './Cuentas.html';
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor.');
    }
  });

  // Diagnóstico: ver qué campo es inválido si activas validación nativa
  form.addEventListener('invalid', (e) => {
    console.warn('Campo inválido:', e.target.name || e.target.id, e.target.validationMessage);
  }, true);
});