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

const dbLocal = mongoose.createConnection('mongodb://adelissanchez16_db_user:adelis@ac-gbr35zd-shard-00-00.ilj0krv.mongodb.net:27017,ac-gbr35zd-shard-00-01.ilj0krv.mongodb.net:27017,ac-gbr35zd-shard-00-02.ilj0krv.mongodb.net:27017/asistente-iujo?ssl=true&replicaSet=atlas-pjs17l-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0');
dbLocal.on('error', (err) => console.error("Error conectando a dbLocal (Usuarios):", err));

// Usamos el formato estandar sin +srv para evitar el error de DNS en Node.js
const cloudUri = 'mongodb://reybiergaliniujo03_db_user:sHX3gZwNyAYovohw@ac-flwukhz-shard-00-00.gxtmudw.mongodb.net:27017,ac-flwukhz-shard-00-01.gxtmudw.mongodb.net:27017,ac-flwukhz-shard-00-02.gxtmudw.mongodb.net:27017/prod-patricia?ssl=true&replicaSet=atlas-flwukhz-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
const dbCloud = mongoose.createConnection(cloudUri);
dbCloud.on('error', (err) => console.error("Error conectando a dbCloud (Estadísticas):", err.message));

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Modelos
const Stats = dbCloud.model('Stats', new mongoose.Schema({ consultas: Number }, { collection: 'stadistics', strict: false }));
const User = dbLocal.model('User', new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  colorTema: { type: String, default: 'cyan' },
  avatarUrl: { type: String, default: '' } 
}, { collection: 'usuarios' }));

const ChatLog = dbLocal.model('ChatLog', new mongoose.Schema({
  questions: [String],
  answer: String,
  count: { type: Number, default: 1 },
  date: { type: Date, default: Date.now }
}, { collection: 'chatlogs' }));

// Rutas
app.get('/api/stats', async (req, res) => {
  try {
    const data = await Stats.findOne();
    console.log("Datos de estadísticas leídos de la nube:", data);
    // Intentamos leer 'consultas', pero si el campo se llama distinto, el log nos dirá
    const total = data ? (data.consultas || data.numero_consultas || data.total || 0) : 0;
    res.json({ total });
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

// Rutas para el XML del asistente
app.get('/api/assistant-xml', (req, res) => {
  const xmlPath = path.join(__dirname, '..', 'patricia_api', 'assistant-config.xml');
  fs.readFile(xmlPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, content: data });
  });
});

app.post('/api/assistant-xml', (req, res) => {
  const xmlPath = path.join(__dirname, '..', 'patricia_api', 'assistant-config.xml');
  const { content } = req.body;
  if (typeof content !== 'string') return res.status(400).json({ success: false, error: 'Invalid content' });
  
  fs.writeFile(xmlPath, content, 'utf8', (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

app.listen(3001, () => console.log("🚀 Backend IUJO listo en puerto 3001"));