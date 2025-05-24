import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import crypto from 'crypto';
import dayjs from 'dayjs'; 
import nodemailer from 'nodemailer'; 



const router = express.Router();

// Configura el transportador de correo (ejemplo con Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreplyfrikitamales@gmail.com',
    pass: 'fwjnyidpqsdmthwk'
  }
});

// POST /registrar, recibe un correo, contraseña y direccion del usuario para crear una cuenta en la bdd
router.post('/registrar', async (req, res) => {
  const { nombre_usuario, correo, contrasena, direccion, rol } = req.body;

  try {
    // Validar campos mínimos
    if (!nombre_usuario || !correo || !contrasena || !direccion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    // Verificar si el usuario ya existe
    const [usuariosExistentes] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado.' });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    // Insertar nuevo usuario (rol por defecto = cliente)
    await pool.query(
      'INSERT INTO usuarios (nombre_usuario, correo, contrasena, direccion, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre_usuario, correo, hash, direccion, rol || 'cliente']
    );

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });

  } catch (err) {
    console.error('[Error en /registrar]', err);
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});


router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Faltan credenciales.' });
    }

    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const usuario = usuarios[0];

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    res.json({
      id: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre_usuario: usuario.nombre_usuario
    });

  } catch (error) {
    console.error('[Error en /login]', error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});





// POST /api/solicitar-recuperacion
router.post('/solicitar-recuperacion', async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ error: 'Correo es obligatorio.' });
  }

  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'No existe una cuenta con ese correo.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expiracion = dayjs().add(15, 'minute').format('YYYY-MM-DD HH:mm:ss');

    await pool.query(
      'INSERT INTO tokens_recuperacion (correo, token, expiracion) VALUES (?, ?, ?)',
      [correo, token, expiracion]
    );

    // URL del enlace de recuperación
    const enlace = `http://localhost:4200/restablecer?token=${token}`;

    // Enviar correo con el enlace
    await transporter.sendMail({
      from: 'FrikiTamales <TU_CORREO@gmail.com>',
      to: correo,
      subject: 'Restablece tu contraseña',
      html: `
        <p>Hola 👋, has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <a href="${enlace}">Restablecer contraseña</a>
        <p>Este enlace expirará en 15 minutos.</p>
      `
    });

    res.json({ mensaje: 'Correo de recuperación enviado correctamente.' });

  } catch (err) {
    console.error('[Error en /solicitar-recuperacion]', err);
    res.status(500).json({ error: 'Error al generar token de recuperación.' });
  }
});


router.post('/resetear-contrasena', async (req, res) => {
  const { token, nueva } = req.body;

  if (!token || !nueva) {
    return res.status(400).json({ error: 'Token y nueva contraseña son requeridos.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM tokens_recuperacion WHERE token = ? AND usado = FALSE',
      [token]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Token inválido o ya usado.' });
    }

    const registro = rows[0];
    const ahora = new Date();
    const expira = new Date(registro.expiracion);

    if (ahora > expira) {
      return res.status(400).json({ error: 'Este token ha expirado.' });
    }

    const hash = await bcrypt.hash(nueva, 10);
    await pool.query('UPDATE usuarios SET contrasena = ? WHERE correo = ?', [hash, registro.correo]);
    await pool.query('UPDATE tokens_recuperacion SET usado = TRUE WHERE id = ?', [registro.id]);

    res.json({ mensaje: 'Contraseña actualizada correctamente.' });

  } catch (err) {
    console.error('[Error en /resetear-contrasena]', err);
    res.status(500).json({ error: 'Error al resetear la contraseña.' });
  }
});



export default router;
