// test-simple-frontend.js - Simple test to debug frontend responses
const API_BASE_URL = "http://localhost:3000";

async function testSimple() {
  try {
    // Login
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rohith.sampathi@gmail.com',
        password: 'Password123'
      })
    });

    console.log('Login status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log('Login error:', error);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    const cookieHeader = cookies ? cookies.split(',').map(cookie => cookie.split(';')[0]).join('; ') : '';
    
    // Test assets
    const assetsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      }
    });

    console.log('Assets status:', assetsResponse.status);
    const assetsText = await assetsResponse.text();
    console.log('Assets response:', assetsText);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSimple().catch(console.error);