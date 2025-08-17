// test-crown-vault-fixed.js - Test Crown Vault with correct array format

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hnwi-uwind-p8oqb.ondigitalocean.app";

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

async function testCrownVaultBatchWithCorrectFormat() {
  console.log('🔍 Testing Crown Vault Batch with CORRECT ARRAY format...\n');
  
  try {
    console.log('🔐 Logging in...');
    const { token, userId } = await login();
    console.log(`✅ Login successful. User ID: ${userId}`);
    
    const testCases = [
      {
        name: "Single asset in array format",
        data: [{
          raw_text: "Real Estate Property in Mumbai, Bandra West. Luxury 3BHK apartment worth $500,000. Fully furnished with sea view.",
          context: "Personal Real Estate"
        }]
      },
      {
        name: "Multiple assets in array format",
        data: [
          {
            raw_text: "Stock Portfolio: Apple Inc (AAPL) 100 shares at $150, Microsoft (MSFT) 50 shares at $300. Total value $30,000.",
            context: "Investment Portfolio"
          },
          {
            raw_text: "Gold jewelry collection worth twenty-five thousand dollars including necklaces, rings, and earrings.",
            context: "Jewelry Collection"
          }
        ]
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`\nTesting: ${testCase.name}`);
        console.log(`Data: ${JSON.stringify(testCase.data, null, 2)}`);
        
        const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets/batch`, {
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
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCrownVaultBatchWithCorrectFormat().catch(console.error);