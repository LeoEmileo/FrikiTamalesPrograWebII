// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Ruta al archivo XML (asegúrate de que esté en el directorio del backend)
const xmlFilePath = path.join(__dirname, 'assets', 'productos.xml');
const parser = new xml2js.Parser();
const builder = new xml2js.Builder({ headless: false, renderOpts: { pretty: true } });

// GET: Obtener productos
app.get('/api/productos', (req, res) => {
  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo el archivo XML' });
    parser.parseString(data, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error parseando el XML' });
      const productos = result.productos.producto || [];
      const productosFormateados = productos.map(p => ({
        id: parseInt(p.id[0], 10),
        nombre: p.nombre[0],
        precio: parseFloat(p.precio[0]),
        cantidad: parseInt(p.cantidad[0], 10),
        imagen: p.imagen[0]
      }));
      res.json(productosFormateados);
    });
  });
});

// POST: Crear un producto nuevo
app.post('/api/productos', (req, res) => {
  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo el archivo XML' });
    parser.parseString(data, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error parseando el XML' });
      
      // Nuevo producto recibido en el cuerpo
      const nuevoProducto = req.body;
      // Convertir a números
      nuevoProducto.precio = parseFloat(nuevoProducto.precio);
      nuevoProducto.cantidad = parseInt(nuevoProducto.cantidad, 10);

      let productos = result.productos.producto || [];
      // Calcula el nuevo ID basado en el máximo actual, asumiendo IDs numéricos y un base mínimo, por ejemplo 100000
      const maxId = productos.reduce((acc, p) => Math.max(acc, parseInt(p.id[0], 10)), 100000);
      nuevoProducto.id = (maxId + 1).toString();

      // Agrega el nuevo producto (cada propiedad se guarda como array según xml2js)
      productos.push({
        id: [nuevoProducto.id],
        nombre: [nuevoProducto.nombre],
        precio: [nuevoProducto.precio.toString()],
        cantidad: [nuevoProducto.cantidad.toString()],
        imagen: [nuevoProducto.imagen]
      });
      result.productos.producto = productos;

      const xmlActualizado = builder.buildObject(result);
      fs.writeFile(xmlFilePath, xmlActualizado, err => {
        if (err) return res.status(500).json({ error: 'Error escribiendo el archivo XML' });
        res.json({ message: 'Producto creado correctamente', producto: nuevoProducto });
      });
    });
  });
});

// PUT: Modificar un producto existente
app.put('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo el archivo XML' });
    parser.parseString(data, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error parseando el XML' });
      let productos = result.productos.producto || [];
      const index = productos.findIndex(p => p.id[0] === id);
      if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

      // Validar que la nueva cantidad no sea negativa
      const nuevaCantidad = parseInt(req.body.cantidad, 10);
      if (nuevaCantidad < 0) {
        return res.status(400).json({ error: 'Stock insuficiente' });
      }
      
      productos[index].nombre = [req.body.nombre];
      productos[index].precio = [req.body.precio.toString()];
      productos[index].cantidad = [nuevaCantidad.toString()];
      productos[index].imagen = [req.body.imagen];
      result.productos.producto = productos;

      const xmlActualizado = builder.buildObject(result);
      fs.writeFile(xmlFilePath, xmlActualizado, err => {
        if (err) return res.status(500).json({ error: 'Error escribiendo el archivo XML' });
        res.json({ message: 'Producto modificado correctamente' });
      });
    });
  });
});


// DELETE: Eliminar un producto
app.delete('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo el archivo XML' });
    parser.parseString(data, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error parseando el XML' });
      let productos = result.productos.producto || [];
      const index = productos.findIndex(p => p.id[0] === id);
      if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });
      productos.splice(index, 1);
      result.productos.producto = productos;

      const xmlActualizado = builder.buildObject(result);
      fs.writeFile(xmlFilePath, xmlActualizado, err => {
        if (err) return res.status(500).json({ error: 'Error escribiendo el archivo XML' });
        res.json({ message: 'Producto eliminado correctamente' });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
