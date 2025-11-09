document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos
  const form = document.querySelector('form');
  const inputs = form.querySelectorAll('input[type="password"]');
  const [inputActual, inputNueva, inputConfirmar] = inputs;

  // Crear contenedor de mensajes
  const msg = document.createElement('div');
  msg.className = 'form-message';
  form.appendChild(msg);

  // Utilidad: mostrar mensajes
  function showMessage(type, text) {
    msg.textContent = text;
    msg.className = `form-message ${type}`; // success | error | info
  }

  // Validación de fortaleza de contraseña
  function checkStrength(pw) {
    const reglas = [
      /.{8,}/,          // mínimo 8 caracteres
      /[A-Z]/,          // mayúsculas
      /[a-z]/,          // minúsculas
      /[0-9]/,          // números
      /[^A-Za-z0-9]/    // símbolo
    ];
    const cumplidas = reglas.map(r => r.test(pw)).filter(Boolean).length;
    return cumplidas; // 0 a 5
  }

  // Mostrar feedback de fortaleza en tiempo real
  inputNueva.addEventListener('input', () => {
    const strength = checkStrength(inputNueva.value);
    const niveles = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];
    if (!inputNueva.value) {
      showMessage('info', 'Digite una contraseña nueva.');
      return;
    }
    showMessage('info', `Fortaleza: ${niveles[Math.max(0, strength - 1)]} (${strength}/5)`);
  });

  // Comprobar coincidencia de confirmación
  function checkConfirmMatch() {
    if (!inputConfirmar.value) return;
    if (inputNueva.value !== inputConfirmar.value) {
      showMessage('error', 'La confirmación no coincide con la contraseña nueva.');
      return false;
    }
    return true;
  }

  inputConfirmar.addEventListener('input', checkConfirmMatch);

  // Validación completa del formulario
  function validateForm() {
    // Campos requeridos
    if (!inputActual.value || !inputNueva.value || !inputConfirmar.value) {
      showMessage('error', 'Completa todos los campos.');
      return false;
    }

    // Evitar reutilizar la misma contraseña
    if (inputActual.value === inputNueva.value) {
      showMessage('error', 'La nueva contraseña no puede ser igual a la actual.');
      return false;
    }

    // Fortaleza mínima: al menos 4 de 5 reglas
    const strength = checkStrength(inputNueva.value);
    if (strength < 4) {
      showMessage(
        'error',
        'La contraseña nueva debe tener mínimo 8 caracteres, mayúscula, minúscula y número (idealmente símbolo).'
      );
      return false;
    }

    // Confirmación
    if (!checkConfirmMatch()) return false;

    return true;
  }

  // Envío del formulario (simulado con fetch)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Deshabilitar mientras se envía
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    showMessage('info', 'Procesando solicitud...');

    try {
      // Ajusta la URL al endpoint real de tu backend
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
      }

      const res = await fetch('http://localhost:8080/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: inputActual,
          newPassword: inputNueva.value
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorMsg = data?.message || 'No se pudo cambiar la contraseña.';
        throw new Error(errorMsg);
      }

      showMessage('success', 'Contraseña actualizada correctamente.');
      // Limpieza
      inputs.forEach(i => (i.value = ''));
    } catch (err) {
      showMessage('error', err.message || 'Error inesperado. Intenta de nuevo.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar';
    }
  });
});
