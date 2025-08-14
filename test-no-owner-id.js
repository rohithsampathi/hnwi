// test-no-owner-id.js - Test without owner_id parameter

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

async function testWithoutOwnerId(token, userId) {
  console.log('\n📋 Testing WITHOUT owner_id query parameter...\n');

  const testCases = [
    {
      name: "Single Asset - No query params",
      endpoint: "/api/crown-vault/assets",
      data: {
        raw_text: "I own a luxury 3BHK apartment in Mumbai, Bandra West worth $500,000 USD. It has sea view and is fully furnished.",
        context: "Personal Real Estate"
      }
    },
    {
      name: "Batch Assets - No query params", 
      endpoint: "/api/crown-vault/assets/batch",
      data: [
        {
          raw_text: "I have 100 shares of Apple stock worth $15,000, purchased through Robinhood at $150 per share",
          context: "Stock Portfolio"
        }
      ]
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Endpoint: ${testCase.endpoint}`);
      console.log(`Data: ${JSON.stringify(testCase.data, null, 2)}`);
      
      const response = await fetch(`${API_BASE_URL}${testCase.endpoint}`, {
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
          if (Array.isArray(jsonData)) {
            console.log(`Response: Array with ${jsonData.length} items`);
            console.log('First item:', JSON.stringify(jsonData[0], null, 2));
          } else {
            console.log('Response:', JSON.stringify(jsonData, null, 2));
          }
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('-'.repeat(60));
    }
  }
}

async function testAlternativeEndpoints(token, userId) {
  console.log('\n📋 Testing alternative endpoints...\n');
  
  // Try different endpoint patterns
  const endpoints = [
    "/api/crown-vault/assets",
    `/api/crown-vault/assets/${userId}`,
    "/api/crown-vault/asset",
    "/api/crown-vault/create-asset"
  ];

  const testData = {
    raw_text: "Test asset: Apple stock worth $1000 for endpoint testing purposes only.",
    context: "Test Data"
  };

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });

      console.log(`Status: ${response.status}`);
      
      if (response.status === 404) {
        console.log('❌ Not Found');
      } else if (response.status === 405) {
        console.log('❌ Method Not Allowed');
      } else {
        const responseText = await response.text();
        try {
          const jsonData = JSON.parse(responseText);
          if (response.ok) {
            console.log('✅ SUCCESS');
            console.log('Response:', JSON.stringify(jsonData, null, 2));
          } else {
            console.log('❌ Failed with error:');
            console.log(JSON.stringify(jsonData, null, 2));
          }
        } catch (e) {
          console.log('Raw response:', responseText);
        }
      }
      
      console.log('-'.repeat(40));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('-'.repeat(40));
    }
  }
}

async function testNoOwnerIdParam() {
  console.log('🎯 Testing Crown Vault WITHOUT owner_id parameter...');
  console.log('='.repeat(70));
  
  try {
    console.log('🔐 Logging in...');
    const { token, userId } = await login();
    console.log(`✅ Login successful. User ID: ${userId}`);
    
    await testWithoutOwnerId(token, userId);
    await testAlternativeEndpoints(token, userId);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNoOwnerIdParam().catch(console.error);