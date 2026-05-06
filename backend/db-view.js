require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.error('\n❌ ERROR: DATABASE_URL is not set in your .env file!\n');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function viewDB() {
    try {
        console.log('\n========================================');
        console.log('        SplitSmart — Database Viewer');
        console.log('========================================\n');

        // Friends
        const friendsRes = await pool.query('SELECT * FROM friends ORDER BY created_at ASC');
        console.log(`👥 FRIENDS (${friendsRes.rowCount} records)`);
        console.log('─────────────────────────────────────');
        if (friendsRes.rowCount === 0) {
            console.log('  (no friends added yet)');
        } else {
            friendsRes.rows.forEach(f => {
                const bal = parseFloat(f.balance).toFixed(2);
                const status = bal > 0 ? `gets ₹${bal}` : bal < 0 ? `owes ₹${Math.abs(bal)}` : 'settled';
                console.log(`  • ${f.name.padEnd(20)} ${status.padEnd(20)} [id: ${f.id}]`);
            });
        }

        // Expenses
        const expRes = await pool.query('SELECT * FROM expenses ORDER BY created_at DESC');
        console.log(`\n💸 EXPENSES (${expRes.rowCount} records)`);
        console.log('─────────────────────────────────────');
        if (expRes.rowCount === 0) {
            console.log('  (no expenses recorded yet)');
        } else {
            expRes.rows.forEach(e => {
                const payers = e.payers_data ? JSON.parse(JSON.stringify(e.payers_data)) : [];
                console.log(`  • ${e.description.padEnd(25)} ₹${parseFloat(e.amount).toFixed(2).padEnd(10)} [id: ${e.id}]`);
            });
        }

        // Settlements
        const setRes = await pool.query('SELECT * FROM settlements ORDER BY settled_at DESC LIMIT 20');
        console.log(`\n🤝 RECENT SETTLEMENTS (${setRes.rowCount} records)`);
        console.log('─────────────────────────────────────');
        if (setRes.rowCount === 0) {
            console.log('  (no settlements recorded yet)');
        } else {
            setRes.rows.forEach(s => {
                console.log(`  • ${s.from_friend_id} → ${s.to_friend_id}  ₹${parseFloat(s.amount).toFixed(2)}`);
            });
        }

        console.log('\n========================================\n');
    } catch (err) {
        console.error('❌ Error reading database:', err.message);
        console.error('Have you run "npm run db:setup" first?\n');
    } finally {
        await pool.end();
    }
}

viewDB();
