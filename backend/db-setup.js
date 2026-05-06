require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.error('\n❌ ERROR: DATABASE_URL is not set in your .env file!');
    console.error('Please add your PostgreSQL connection string:');
    console.error('  DATABASE_URL=postgres://username:password@host:5432/dbname\n');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDB() {
    console.log('🔌 Connecting to PostgreSQL...');

    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Connected successfully!\n');

        console.log('📦 Creating tables...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS friends (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                balance NUMERIC DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('  ✔ Table "friends" ready');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id VARCHAR(255) PRIMARY KEY,
                description TEXT NOT NULL,
                amount NUMERIC NOT NULL,
                payers_data JSONB,
                involved_ids JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('  ✔ Table "expenses" ready');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS settlements (
                id SERIAL PRIMARY KEY,
                from_friend_id VARCHAR(255),
                to_friend_id VARCHAR(255),
                amount NUMERIC,
                settled_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('  ✔ Table "settlements" ready');

        console.log('\n✅ Database setup complete! You can now run: npm run dev\n');
    } catch (err) {
        console.error('\n❌ Database connection failed:', err.message);
        console.error('Make sure your DATABASE_URL is correct in the .env file.\n');
    } finally {
        await pool.end();
    }
}

setupDB();
