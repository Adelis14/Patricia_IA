const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    key: { type: String, default: 'assistant-xml' },
    content: { type: String, required: true }
}, { collection: 'config' });

module.exports = mongoose.model('Config', configSchema);
