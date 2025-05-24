// src/index.js
import express from 'express';
import productosRouter from './routes/productos.js';
import cors from 'cors';
import pagarRouter from './routes/pagar.js';
import authRouter from './routes/auth.js';


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRouter);
app.use('/api/pagar', pagarRouter);
app.use('/api', authRouter);



app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Algo salió mal' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}/api/productos`);
});
