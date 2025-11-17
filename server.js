const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Servir archivos estáticos desde la carpeta 'build'
app.use(express.static(path.join(__dirname, 'build')));

// Manejar todas las rutas y devolver index.html
// Esto permite que React Router maneje las rutas en el cliente
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend running on: http://0.0.0.0:${PORT}`);
  console.log(`📱 Access from: http://34.135.23.61:${PORT}`);
});
