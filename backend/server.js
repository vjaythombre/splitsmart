require('dotenv').config({ override: true });
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', groupRoutes);
app.use('/api', expenseRoutes);
app.use('/api/auth', authRoutes);

// DB Viewer Page
app.get('/db-viewer', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/db-viewer.html'));
});

// Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n🚀 SplitSmart running at http://localhost:${PORT}`);
        console.log(`📊 View database at  http://localhost:${PORT}/db-viewer`);
        console.log(`🔌 API status at     http://localhost:${PORT}/api/status\n`);
    });
}

module.exports = app;
