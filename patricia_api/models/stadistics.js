const mongoose = require('mongoose');

const stadisticsSchema = new mongoose.Schema({
    consultas: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Stadistics', stadisticsSchema);
