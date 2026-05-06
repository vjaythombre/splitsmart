const mongoose = require('mongoose');

const calculationLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expenses: { type: Array, required: true },
    transactions: { type: Array, required: true },
}, { timestamps: true });

module.exports = mongoose.model('CalculationLog', calculationLogSchema);
