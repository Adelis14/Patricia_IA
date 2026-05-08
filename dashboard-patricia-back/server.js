const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión principal (Usuarios y Configuración XML)
const mainUri = 'mongodb+srv://adelissanchez16_db_user:adelis@cluster0.ilj0krv.mongodb.net/asistente-iujo?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mainUri)
  .then(() => console.log("✅ Conectado exitosamente a MongoDB Atlas (asistente-iujo)"))
  .catch(err => console.error("❌ Error CRÍTICO conectando a MongoDB:", err.message));

// Ruta de diagnóstico
app.get('/api/test-db', (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
    database: mongoose.connection.name,
    readyState: mongoose.connection.readyState
  });
});

// Multer: Limpiar nombre de archivo para evitar errores en URLs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage });

// Modelos
const Stats = mongoose.model('Stats', new mongoose.Schema({ consultas: Number }, { collection: 'estadisticas', strict: false }));
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  colorTema: { type: String, default: 'cyan' },
  avatarUrl: { type: String, default: '' } 
}, { collection: 'usuarios' }));

const ChatLog = mongoose.model('ChatLog', new mongoose.Schema({
  questions: [String],
  answer: String,
  count: { type: Number, default: 1 },
  date: { type: Date, default: Date.now }
}, { collection: 'chatlogs' }));

const Config = mongoose.model('Config', new mongoose.Schema({
  key: { type: String, default: 'assistant-xml' },
  content: { type: String, required: true }
}, { collection: 'config' }));

// Rutas
app.get('/api/stats', async (req, res) => {
  try {
    const s = await mongoose.model('Stats').findOne().lean();
    res.json({ total: s ? s.consultas : 0 });
  } catch (error) {
    console.error("Error obteniendo stats:", error);
    res.status(500).json({ total: 0 });
  }
});

app.get('/api/chatlogs', async (req, res) => {
  try {
    const logs = await ChatLog.find({ count: { $gt: 1 } }).sort({ count: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    console.error("Error obteniendo chatlogs:", error);
    res.status(500).json({ success: false, logs: [] });
  }
});

app.post('/api/login', async (req, res) => {
  const { user, pass } = req.body;
  const found = await User.findOne({ username: user, password: pass });
  if (found) res.json({ 
    success: true, 
    username: found.username, 
    colorTema: found.colorTema, 
    avatarUrl: found.avatarUrl 
  });
  else res.status(401).json({ success: false });
});

app.post('/api/update-profile', upload.single('avatar'), async (req, res) => {
  const { username, newPassword, colorTema } = req.body;
  try {
    const updateData = {};
    if (newPassword) updateData.password = newPassword;
    if (colorTema) updateData.colorTema = colorTema;
    if (req.file) updateData.avatarUrl = `https://dashboard-api-0bfr.onrender.com/uploads/${req.file.filename}`;

    await User.updateOne({ username }, { $set: updateData });
    res.json({ success: true, avatarUrl: updateData.avatarUrl });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Rutas para el XML del asistente (Ahora en MongoDB)
app.get('/api/assistant-xml', async (req, res) => {
  try {
    let config = await Config.findOne({ key: 'assistant-xml' });
    if (!config) {
      // Fallback por si Patricia API aún no lo ha creado
      return res.json({ success: true, content: "<!-- El XML se inicializará cuando Patricia responda su primera pregunta o puedes pegarlo aquí -->" });
    }
    res.json({ success: true, content: config.content });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/assistant-xml', async (req, res) => {
  const { content } = req.body;
  if (typeof content !== 'string') return res.status(400).json({ success: false, error: 'Invalid content' });
  
  try {
    console.log("🧹 Limpiando configuración anterior...");
    await Config.deleteMany({ key: 'assistant-xml' });
    
    console.log("💾 Insertando nuevo XML en la base de datos:", mongoose.connection.name);
    const nuevoConfig = new Config({ key: 'assistant-xml', content });
    await nuevoConfig.save();
    
    console.log("✅ XML guardado físicamente en Atlas. Longitud:", content.length);
    res.json({ success: true, length: content.length });
  } catch (err) {
    console.error("❌ Error FATAL guardando XML:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => console.log("🚀 Backend IUJO listo en puerto 3001"));