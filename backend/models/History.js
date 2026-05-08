const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    payerText: { type: String, required: true },
    involvedNames: { type: String, required: true },
    settlements: [{
        fromName: String,
        toName: String,
        amount: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);
