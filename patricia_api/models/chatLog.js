const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    questions: {
        type: [String],
        default: []
    },
    answer: {
        type: String
    },
    count: {
        type: Number,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
