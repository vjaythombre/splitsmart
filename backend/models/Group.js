const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    balance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
