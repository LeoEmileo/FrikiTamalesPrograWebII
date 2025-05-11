// src/routes/pagar.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
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
  const { total } = req.body;

  try {
    const accessToken = await generarToken();

    const response = await axios.post(`${base}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'MXN',
          value: total
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

    res.json({ id: response.data.id, links: response.data.links });
  } catch (error) {
    console.error('[PayPal Error]', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al crear orden de PayPal' });
  }
});

export default router;
