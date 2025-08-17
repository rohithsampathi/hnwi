// debug-crown-vault.js - Debug Crown Vault batch processing

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hnwi-uwind-p8oqb.ondigitalocean.app";

// First, let's login to get a token
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

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

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

// Test different batch processing formats
async function testBatchProcessing(token, userId) {
  console.log('\n🔍 Testing different batch processing formats...\n');

  const testCases = [
    {
      name: "Original format",
      data: {
        raw_text: "Test Asset: Real Estate Property in Mumbai worth $500,000",
        context: "API Test"
      }
    },
    {
      name: "Minimal format",
      data: {
        raw_text: "Real Estate Property worth $500,000"
      }
    },
    {
      name: "Detailed format",
      data: {
        raw_text: "Real Estate Property in Mumbai, India. Market value: $500,000 USD. Location: Bandra West. Property type: Apartment.",
        context: "Personal Assets"
      }
    },
    {
      name: "Single asset format",
      data: {
        raw_text: "Stock Portfolio: Apple Inc (AAPL) - 100 shares at $150 per share = $15,000",
        context: "Investment Portfolio"
      }
    },
    {
      name: "Empty context",
      data: {
        raw_text: "Gold Jewelry worth $25,000",
        context: ""
      }
    },
    {
      name: "No context field",
      data: {
        raw_text: "Bank Account: Savings account with $100,000 balance"
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Data: ${JSON.stringify(testCase.data, null, 2)}`);
      
      const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets/batch?owner_id=${userId}`, {
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
      
      console.log('-'.repeat(50));
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('-'.repeat(50));
    }
  }
}

// Test individual asset creation endpoint (if it exists)
async function testIndividualAssetCreation(token, userId) {
  console.log('\n🔍 Testing individual asset creation...\n');

  const assetData = {
    asset_data: {
      name: "Test Real Estate",
      asset_type: "Real Estate",
      value: 500000,
      currency: "USD",
      location: "Mumbai, India",
      notes: "API Test Asset"
    }
  };

  try {
    console.log('Testing individual asset creation:');
    console.log(`Data: ${JSON.stringify(assetData, null, 2)}`);
    
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets?owner_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(assetData)
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
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

// Test heir creation to see expected format
async function testHeirCreation(token, userId) {
  console.log('\n🔍 Testing heir creation for reference...\n');

  const heirData = {
    name: "Test Heir",
    relationship: "Spouse",
    email: "test.heir@example.com",
    phone: "+1234567890",
    notes: "API Test Heir"
  };

  try {
    console.log('Testing heir creation:');
    console.log(`Data: ${JSON.stringify(heirData, null, 2)}`);
    
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/heirs?owner_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(heirData)
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
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

// Main debug function
async function debugCrownVault() {
  console.log('🚀 Starting Crown Vault Debug Session...');
  console.log('='.repeat(60));
  
  try {
    // Login first
    console.log('🔐 Logging in...');
    const { token, userId } = await login();
    console.log(`✅ Login successful. User ID: ${userId}`);
    
    // Test batch processing with different formats
    await testBatchProcessing(token, userId);
    
    // Test individual asset creation
    await testIndividualAssetCreation(token, userId);
    
    // Test heir creation for reference
    await testHeirCreation(token, userId);
    
    console.log('\n🎯 Debug session complete!');
    
  } catch (error) {
    console.error('❌ Debug session failed:', error.message);
  }
}

// Run the debug
debugCrownVault().catch(console.error);