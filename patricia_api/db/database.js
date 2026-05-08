require("dotenv").config();

const mongoose = require("mongoose");

let connection = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(connection, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Conectando a mongodb exitosamente");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

module.exports = { connectDB };