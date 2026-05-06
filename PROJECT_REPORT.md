# SplitSmart - Professional Expense Tracker

## 📖 Project Overview
SplitSmart is a modern, full-stack expense management application designed to help friends, roommates, and groups track shared expenses and calculate the most optimized way to settle debts. 

Unlike traditional ledgers, SplitSmart uses an algorithmic approach to minimize the total number of transactions required to settle everyone's balances. It features a premium, responsive glassmorphism UI backed by a secure, multi-user backend.

---

## 🚀 Tech Stack
- **Frontend:** Vanilla JavaScript, HTML5, CSS3, Vanta.js (3D Network Background)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Deployment:** Vercel (Frontend & Serverless Backend)

---

## ✨ Key Features & Implementation Details

### 1. Secure User Authentication & Data Isolation
The app features complete user isolation. A custom middleware intercepts API requests, verifies the JWT token, and ensures users can only access their own expenses and groups.

**Auth Middleware (`backend/middleware/auth.js`):**
```javascript
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded; // Attach user info to the request
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};
```

**Frontend API Wrapper:**
The frontend intercepts all network calls to inject the JWT token seamlessly.
```javascript
async function apiFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 401) {
        logout();
        throw new Error("Unauthorized");
    }
    return res;
}
```

### 2. Database Schema (MongoDB / Mongoose)
The data models enforce structural integrity and automatically tie every record back to the authenticated user (`userId`).

**Expense Model (`backend/models/Expense.js`):**
```javascript
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    id: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    payersData: { type: Array, default: [] },
    involvedIds: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
```

### 3. Optimized Settlement Algorithm (Core Engine)
The heart of SplitSmart is its settlement engine. Instead of users paying back exactly who paid for them (which leads to a chaotic web of transactions), the algorithm pools all balances and matches the biggest debtors with the biggest creditors.

**Algorithm Logic (`frontend/index.html`):**
```javascript
function calculateSettlements() {
    let debtors = [], creditors = [];
    
    // Split people into those who owe money (-) and those who are owed (+)
    for (const [id, bal] of Object.entries(balances)) {
        if (bal < -0.01) debtors.push({ id, amount: Math.abs(bal) });
        else if (bal > 0.01) creditors.push({ id, amount: bal });
    }

    // Sort to match biggest debtors with biggest creditors first
    debtors.sort((a,b) => b.amount - a.amount);
    creditors.sort((a,b) => b.amount - a.amount);

    let transactions = [];
    let i = 0, j = 0;

    // Resolve balances iteratively
    while (i < debtors.length && j < creditors.length) {
        let d = debtors[i], c = creditors[j];
        let minAmt = Math.min(d.amount, c.amount);
        
        if(minAmt > 0.01) {
            transactions.push({ from: d.id, to: c.id, amount: minAmt });
        }

        d.amount -= minAmt;
        c.amount -= minAmt;

        if (Math.abs(d.amount) < 0.01) i++;
        if (Math.abs(c.amount) < 0.01) j++;
    }

    return transactions;
}
```

### 4. Comprehensive Expense History
The history view dynamically reconstructs past events. It not only logs what was paid, but it runs a localized version of the settlement algorithm on *individual expenses* so users can click an expense and see exactly how it was split.

**Expense-Specific Splitting Logic:**
```javascript
function getExpenseSettlement(expense) {
    const involved = (expense.involvedIds && expense.involvedIds.length > 0) ? expense.involvedIds : friends.map(f=>f.id);
    const splitAmount = expense.amount / involved.length;
    let localBalances = {};
    friends.forEach(f => localBalances[f.id] = 0);
    
    // Deduct the split amount from everyone involved
    involved.forEach(id => localBalances[id] -= splitAmount);
    
    // Credit the people who actually paid
    if (expense.payersData) {
        expense.payersData.forEach(p => localBalances[p.id] += p.amount);
    }

    // Pass `localBalances` through the Optimized Settlement Algorithm 
    // to generate specific debts for this single expense!
    return calculateLocalTransactions(localBalances); 
}
```

---

## 🛠 Setup & Installation

### Local Development
1. Run `npm install` to install backend dependencies.
2. Create a `.env` file in the root directory with the following variables:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0...
   JWT_SECRET=your_super_secret_key
   PORT=8000
   ```
3. Run the development server using `npm run dev` (starts nodemon).
4. Open your browser and navigate to `http://localhost:8000`.

### Vercel Deployment Architecture
The application is configured to run on Vercel as a hybrid app using a custom `vercel.json` routing configuration:
```json
{
  "version": 2,
  "builds": [
    { "src": "backend/server.js", "use": "@vercel/node" },
    { "src": "frontend/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/server.js" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ]
}
```
This forces all `/api/` traffic to cold-start the Express backend as a serverless function, while serving the HTML/CSS lightning fast from Vercel's global CDN.

---

*Note: This document will be continually updated as new features and architectural changes are introduced to the project.*
