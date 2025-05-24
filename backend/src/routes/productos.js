// src/routes/productos.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();



// POST /api/productos - Crear un producto
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, categoria, stock, imagen_url } = req.body;

  if (!nombre || !precio || !stock || !imagen_url) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  try {
    await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, categoria, stock, imagen_url) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, categoria, stock, imagen_url]
    );
    res.status(201).json({ mensaje: 'Producto creado correctamente.' });
  } catch (err) {
    console.error('[Error en POST /productos]', err);
    res.status(500).json({ error: 'Error al crear producto.' });
  }
});

// PUT /api/productos/:id - Actualizar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, categoria, stock, imagen_url } = req.body;
  if (!nombre || !precio || !stock || !imagen_url) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  try {
    const [resultado] = await pool.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, stock = ?, imagen_url = ? WHERE id_producto = ?',
      [nombre, descripcion, precio, categoria, stock, imagen_url, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({ mensaje: 'Producto actualizado correctamente.' });
  } catch (err) {
    console.error('[Error en PUT /productos/:id]', err);
    res.status(500).json({ error: 'Error al actualizar producto.' });
  }
});

// DELETE /api/productos/:id - Eliminar producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente.' });
  } catch (err) {
    console.error('[Error en DELETE /productos/:id]', err);
    res.status(500).json({ error: 'Error al eliminar producto.' });
  }
});

// GET /api/productos - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT * FROM productos');
    res.json(productos);
  } catch (err) {
    console.error('[Error en GET /productos]', err);
    res.status(500).json({ error: 'Error al obtener productos.' });
  }
});

// GET /api/productos/:id - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [productos] = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [id]);

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(productos[0]);
  } catch (err) {
    console.error('[Error en GET /productos/:id]', err);
    res.status(500).json({ error: 'Error al obtener producto.' });
  }
});






export default router;
