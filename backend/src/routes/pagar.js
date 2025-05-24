// src/routes/pagar.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

const router = express.Router();

const CLIENT = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;
const base = 'https://api-m.sandbox.paypal.com';

async function generarToken() {
  const res = await axios({
    url: `${base}/v1/oauth2/token`,
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    auth: { username: CLIENT, password: SECRET },
    data: 'grant_type=client_credentials'
  });
  return res.data.access_token;
}


router.post('/', async (req, res) => {
  
  const { total, carrito, id_usuario } = req.body;

  if (!Array.isArray(carrito) || typeof id_usuario !== 'number' || typeof total !== 'number') {
    return res.status(400).json({ error: 'Datos de pago incompletos.' });
  }

  try {
    const accessToken = await generarToken();

    const response = await axios.post(`${base}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'MXN',
          value: total.toFixed(2)
        }
      }],
      application_context: {
        return_url: 'http://localhost:4200/pago-exitoso',
        cancel_url: 'http://localhost:4200/pago-cancelado'
      }
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const orderId = response.data.id;

    // --- 🔁 Registrar pedido y detalles en MySQL ---
    const [pedidoResult] = await pool.query(
      'INSERT INTO pedidos (id_usuario, fecha_pedido, total) VALUES (?, NOW(), ?)',
      [id_usuario, total]
    );

    const id_pedido = pedidoResult.insertId;

    for (const item of carrito) {
      await pool.query(
        'INSERT INTO detallepedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [id_pedido, item.producto.id, item.cantidad, item.producto.precio]
      );
    }

    await pool.query(
      'INSERT INTO pagos (id_pedido, estado_pago, fecha_pago) VALUES (?, ?, NOW())',
      [id_pedido, 'COMPLETADO']
    );

    res.json({ id: orderId, links: response.data.links });

  } catch (error) {
    console.error('[PayPal Error]', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al crear orden de PayPal' });
  }
});


export default router;
