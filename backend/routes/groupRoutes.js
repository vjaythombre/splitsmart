const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const auth = require('../middleware/auth');

// Get application state
router.get('/state', auth, async (req, res) => {
    try {
        const friends = await Group.find({ userId: req.user.id }).sort({ createdAt: 1 });
        const expenses = await Expense.find({ userId: req.user.id }).sort({ createdAt: 1 });
        
        res.json({
            friends: friends.map(f => ({ id: f.id, name: f.name, balance: f.balance })),
            expenses: expenses.map(e => ({
                id: e.id,
                description: e.description,
                amount: e.amount,
                payersData: e.payersData,
                involvedIds: e.involvedIds
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a friend / group member
router.post('/friends', auth, async (req, res) => {
    const { id, name, balance = 0 } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'id and name required' });
    try {
        await Group.findOneAndUpdate(
            { id, userId: req.user.id }, 
            { id, name, balance, userId: req.user.id }, 
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a friend
router.delete('/friends/:id', auth, async (req, res) => {
    try {
        await Group.findOneAndDelete({ id: req.params.id, userId: req.user.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset all data for the user
router.post('/reset', auth, async (req, res) => {
    try {
        await Group.deleteMany({ userId: req.user.id });
        await Expense.deleteMany({ userId: req.user.id });
        await Settlement.deleteMany({ userId: req.user.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DB Status check
router.get('/status', async (req, res) => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
        return res.json({ connected: false, message: 'MongoDB not connected' });
    }
    try {
        const friends = await Group.countDocuments();
        const expenses = await Expense.countDocuments();
        const settlements = await Settlement.countDocuments();
        res.json({
            connected: true,
            serverTime: new Date(),
            records: { friends, expenses, settlements }
        });
    } catch (err) {
        res.json({ connected: false, message: err.message });
    }
});

module.exports = router;
