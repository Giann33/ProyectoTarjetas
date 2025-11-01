const express = require('express');
const app = express();
const PORT = 3000; // tu front en 3000, tu Spring está en 8081

// para servir archivos estáticos (html, css, js) desde la carpeta public
app.use(express.static('public'));

app.get('/api/ping', (req, res) => {
    res.json({ ok: true, msg: 'Frontend Node.js funcionando 🚀' });
});

app.listen(PORT, () => {
    console.log(`Servidor frontend escuchando en http://localhost:${PORT}`);
});