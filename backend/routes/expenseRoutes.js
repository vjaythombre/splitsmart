const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const auth = require('../middleware/auth');

// Add an expense
router.post('/expenses', auth, async (req, res) => {
    const { id, description, amount, payersData, involvedIds } = req.body;
    if (!id || !description || !amount) return res.status(400).json({ error: 'id, description, amount required' });
    try {
        await Expense.findOneAndUpdate(
            { id, userId: req.user.id },
            { id, description, amount, payersData, involvedIds, userId: req.user.id },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an expense
router.delete('/expenses/:id', auth, async (req, res) => {
    try {
        await Expense.findOneAndDelete({ id: req.params.id, userId: req.user.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save a settlement log
router.post('/settlements', auth, async (req, res) => {
    const { from, to, amount } = req.body;
    try {
        await Settlement.create({ from, to, amount, userId: req.user.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get settlement history (old)
router.get('/settlements', auth, async (req, res) => {
    try {
        const history = await Settlement.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const CalculationLog = require('../models/CalculationLog');

// Save a calculation log snapshot
router.post('/calculation-logs', auth, async (req, res) => {
    try {
        await CalculationLog.create({
            userId: req.user.id,
            expenses: req.body.expenses,
            transactions: req.body.transactions
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get calculation logs
router.get('/calculation-logs', auth, async (req, res) => {
    try {
        const logs = await CalculationLog.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
