const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
    from: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Settlement', settlementSchema);
