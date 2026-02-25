const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://waqf:waqf_secret@localhost:5433/waqf?schema=public'
});

async function test() {
    try {
        await client.connect();
        console.log('✅ Connected successfully!');
        const res = await client.query('SELECT version()');
        console.log('PostgreSQL version:', res.rows[0].version);
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

test();
