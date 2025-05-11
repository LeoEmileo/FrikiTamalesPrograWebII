// src/routes/productos.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/productos
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
