import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testLogin(email, password, description) {
  console.log(`\n--- Testing ${description} ---`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    return { status: response.status, data };
  } catch (error) {
    console.error('Error:', error.message);
    return { error: error.message };
  }
}

async function main() {
  // Wait for server to be ready
  console.log('Waiting for server to be ready...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 1. Test with User's payload (Expected Failure)
  await testLogin('admin@kejayangukenya.com', 'Admin123', 'User Payload (Incorrect Email/Pass)');

  // 2. Test with Correct Credentials (Expected Success)
  await testLogin('admin@kejayangu.com', '123456', 'Correct Credentials');
}

main();
