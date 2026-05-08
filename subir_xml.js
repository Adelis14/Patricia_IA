const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// TU URI DE ATLAS (La misma que usa Patricia)
const uri = 'mongodb://adelissanchez16_db_user:adelis@ac-gbr35zd-shard-00-00.ilj0krv.mongodb.net:27017,ac-gbr35zd-shard-00-01.ilj0krv.mongodb.net:27017,ac-gbr35zd-shard-00-02.ilj0krv.mongodb.net:27017/asistente-iujo?ssl=true&replicaSet=atlas-pjs17l-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function subir() {
    try {
        console.log("🚀 Conectando directamente a MongoDB Atlas...");
        await mongoose.connect(uri);
        console.log("✅ Conexión establecida.");

        // Definir el modelo
        const Config = mongoose.model('Config', new mongoose.Schema({
            key: String,
            content: String
        }, { collection: 'config' }));

        // Leer el archivo local
        const xmlPath = path.join(__dirname, 'patricia_api', 'assistant-config.xml');
        if (!fs.existsSync(xmlPath)) {
            console.error("❌ No encontré el archivo assistant-config.xml en patricia_api/");
            process.exit(1);
        }

        const contenido = fs.readFileSync(xmlPath, 'utf8');
        console.log("📄 Archivo leído con éxito. Tamaño:", contenido.length, "caracteres.");

        // Limpiar y subir
        await Config.deleteMany({ key: 'assistant-xml' });
        await Config.create({ key: 'assistant-xml', content: contenido });

        console.log("⭐ ¡XML SUBIDO A ATLAS CON ÉXITO! ⭐");
        console.log("Ahora Patricia debería reconocer los cambios inmediatamente.");
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Error durante la subida:", err);
        process.exit(1);
    }
}

subir();
