const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    payersData: { type: Object, default: {} },
    involvedIds: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
