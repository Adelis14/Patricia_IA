//Variables de entorno
require('dotenv').config();

//Librerias de rutas
const express = require('express');
const app = express();

//Libreria back conectar con front
const cors = require('cors');
const { connectDB } = require('../db/database');

//Archivos de rutas
const apiPrincipal = require('../routes/open_ai')

const port = process.env.PORT || 8080;

app.use(cors());

app.use(express.json());

connectDB();

app.use('/api/openai', apiPrincipal); 


  app.use((req, res) => {
    res.status(404).json({ mensaje: 'Recurso no encontrado. La ruta que buscas no existe.' });
  });


  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});


