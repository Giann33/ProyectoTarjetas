document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btn-logout');
  
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      // Elimina los datos del usuario almacenados
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // si luego usas JWT
      
      // Redirige al login
      location.replace('index.html');
    });
  }
});