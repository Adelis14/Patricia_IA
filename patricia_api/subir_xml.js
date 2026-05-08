const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb://adelissanchez16_db_user:adelis@ac-gbr35zd-shard-00-00.ilj0krv.mongodb.net:27017,ac-gbr35zd-shard-00-01.ilj0krv.mongodb.net:27017,ac-gbr35zd-shard-00-02.ilj0krv.mongodb.net:27017/asistente-iujo?ssl=true&replicaSet=atlas-pjs17l-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function subir() {
    try {
        console.log("🚀 Conectando directamente a MongoDB Atlas...");
        await mongoose.connect(uri);
        console.log("✅ Conexión establecida.");

        const Config = mongoose.model('Config', new mongoose.Schema({
            key: String,
            content: String
        }, { collection: 'config' }));

        const xmlPath = path.join(__dirname, 'assistant-config.xml');
        const contenido = fs.readFileSync(xmlPath, 'utf8');
        console.log("📄 Archivo leído. Tamaño:", contenido.length);

        await Config.deleteMany({ key: 'assistant-xml' });
        await Config.create({ key: 'assistant-xml', content: contenido });

        console.log("⭐ ¡XML SUBIDO A ATLAS CON ÉXITO! ⭐");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}
subir();
