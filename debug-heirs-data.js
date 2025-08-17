// debug-heirs-data.js - Debug heirs data structure
const API_BASE_URL = "http://localhost:8000";

async function login() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'rohith.sampathi@gmail.com',
        password: 'Password123'
      })
    });

    const data = await response.json();
    return {
      token: data.access_token || data.token,
      userId: data.user_id || data.user?.id || data.id
    };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

async function debugHeirs() {
  try {
    const { token, userId } = await login();
    console.log(`User ID: ${userId}`);
    
    console.log('\n🔍 Debugging heirs data structure...');
    
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/heirs?owner_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Raw heirs response:', JSON.stringify(data, null, 2));
    
    console.log('\n📋 Heirs analysis:');
    data.forEach((heir, index) => {
      console.log(`Heir ${index + 1}:`);
      console.log(`  Name: ${heir.name}`);
      console.log(`  ID: ${heir.id || 'MISSING!'}`);
      console.log(`  Heir ID: ${heir.heir_id || 'MISSING!'}`);
      console.log(`  All keys:`, Object.keys(heir));
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugHeirs().catch(console.error);