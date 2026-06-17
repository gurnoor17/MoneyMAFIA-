const db = require('./config/db');

async function run() {
  try {
    const testQuery = await db.query('SELECT * FROM transactions');
    console.log('--- All Transactions ---');
    console.log(JSON.stringify(testQuery.rows, null, 2));
    
    const users = await db.query('SELECT id, name, email FROM users');
    console.log('--- Users ---');
    console.log(JSON.stringify(users.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Test db error:', err.message);
    process.exit(1);
  }
}

run();

