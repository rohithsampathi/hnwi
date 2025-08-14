// test-correct-format.js - Test the actual format the frontend expects

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com";

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

async function testThroughFrontendProxy(token, userId) {
  console.log('\n🎯 Testing through FRONTEND proxy (localhost:3000)...\n');

  const testCases = [
    {
      name: "Long enough text with context (>50 chars)",
      data: {
        raw_text: "Real Estate Property in Mumbai, Bandra West. Luxury 3BHK apartment worth $500,000. Fully furnished with sea view.",
        context: "Personal Real Estate"
      }
    },
    {
      name: "Investment portfolio (>50 chars)",
      data: {
        raw_text: "Stock Portfolio: Apple Inc (AAPL) 100 shares at $150, Microsoft (MSFT) 50 shares at $300. Total value $30,000.",
        context: "Investment Portfolio"
      }
    },
    {
      name: "Minimal valid text (exactly 50 chars)",
      data: {
        raw_text: "Gold jewelry collection worth twenty-five thousand",
        context: "Jewelry"
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Text length: ${testCase.data.raw_text.length} characters`);
      console.log(`Data: ${JSON.stringify(testCase.data, null, 2)}`);
      
      // Test through the frontend proxy at localhost:3000
      const response = await fetch(`http://localhost:3000/api/crown-vault/assets/batch?owner_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testCase.data)
      });

      const responseText = await response.text();
      
      if (response.ok) {
        console.log(`✅ SUCCESS (${response.status})`);
        try {
          const jsonData = JSON.parse(responseText);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('Response:', responseText);
        }
      } else {
        console.log(`❌ FAILED (${response.status})`);
        try {
          const errorData = JSON.parse(responseText);
          console.log('Error details:', JSON.stringify(errorData, null, 2));
        } catch (e) {
          console.log('Raw error:', responseText);
        }
      }
      
      console.log('-'.repeat(60));
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('-'.repeat(60));
    }
  }
}

async function testDirectBackend(token, userId) {
  console.log('\n🎯 Testing DIRECT backend for comparison...\n');
  
  // Test what the backend actually accepts
  const testData = {
    raw_text: "Real Estate Property in Mumbai, Bandra West. Luxury 3BHK apartment worth $500,000. Fully furnished with sea view.",
    context: "Personal Real Estate"
  };

  try {
    console.log('Testing direct backend call:');
    console.log(`Data: ${JSON.stringify(testData, null, 2)}`);
    
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets/batch?owner_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    const responseText = await response.text();
    
    console.log(`Status: ${response.status}`);
    try {
      const jsonData = JSON.parse(responseText);
      console.log('Response:', JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Response:', responseText);
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

async function testCorrectFormat() {
  console.log('🎯 Testing CORRECT format through frontend proxy...');
  console.log('='.repeat(70));
  
  try {
    console.log('🔐 Logging in...');
    const { token, userId } = await login();
    console.log(`✅ Login successful. User ID: ${userId}`);
    
    await testThroughFrontendProxy(token, userId);
    await testDirectBackend(token, userId);
    
    console.log('\n🎯 Test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCorrectFormat().catch(console.error);