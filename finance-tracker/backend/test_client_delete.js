const db = require('./database/db');

async function runTest() {
  const PORT = 5050;
  const BASE_URL = `http://localhost:${PORT}/api`;
  const email = `temp_${Date.now()}@example.com`;
  const password = 'password123';
  
  try {
    console.log('1. Registering temp user...');
    let res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Temp Tester', email, password })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(data.message);
    const token = data.token;
    console.log('Success! Token received.');

    console.log('2. Adding a temp transaction...');
    res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Temp Expense',
        amount: '12.50',
        category: 'Food',
        type: 'expense',
        transaction_date: new Date().toISOString().split('T')[0]
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(data.message);
    const txId = data.id;
    console.log(`Success! Created transaction with ID: ${txId}`);

    console.log('3. Trying to DELETE the transaction...');
    res = await fetch(`${BASE_URL}/transactions/${txId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    data = await res.json();
    console.log('DELETE response status:', res.status);
    console.log('DELETE response data:', data);
    
    if (res.ok) {
      console.log('DELETE TEST PASSED SUCCESSFULLY!');
    } else {
      console.error('DELETE TEST FAILED:', data.message);
    }
    
    // Cleanup database user to keep it clean
    console.log('4. Cleaning up test user...');
    await db.query('DELETE FROM users WHERE email = $1', [email]);
    console.log('Cleanup complete.');
    
    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    console.error('Test error:', err.message);
    process.exit(1);
  }
}

runTest();
