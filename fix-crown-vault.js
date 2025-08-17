// fix-crown-vault.js - Test corrected formats

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

async function testFixedBatchProcessing(token, userId) {
  console.log('\n🔧 Testing FIXED batch processing formats...\n');

  const testCases = [
    {
      name: "Array format - single asset",
      data: [
        {
          raw_text: "Real Estate Property in Mumbai worth $500,000",
          context: "Personal Assets"
        }
      ]
    },
    {
      name: "Array format - multiple assets",
      data: [
        {
          raw_text: "Real Estate Property in Mumbai worth $500,000",
          context: "Personal Assets"
        },
        {
          raw_text: "Stock Portfolio: Apple Inc - 100 shares at $150 = $15,000",
          context: "Investment Portfolio"
        }
      ]
    },
    {
      name: "Simple array of strings",
      data: [
        "Real Estate Property worth $500,000",
        "Gold Jewelry worth $25,000"
      ]
    },
    {
      name: "Empty array",
      data: []
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('-'.repeat(50));
    }
  }
}

async function testFixedAssetCreation(token, userId) {
  console.log('\n🔧 Testing FIXED individual asset creation...\n');

  const testCases = [
    {
      name: "Without user_id in body",
      data: {
        asset_data: {
          name: "Test Real Estate",
          asset_type: "Real Estate",
          value: 500000,
          currency: "USD",
          location: "Mumbai, India",
          notes: "API Test Asset"
        }
      }
    },
    {
      name: "Minimal asset data",
      data: {
        name: "Test Stock",
        asset_type: "Stocks",
        value: 15000,
        currency: "USD"
      }
    },
    {
      name: "Direct fields (not nested)",
      data: {
        name: "Test Bond",
        asset_type: "Bonds",
        value: 25000,
        currency: "USD",
        location: "USA",
        notes: "Government Bond"
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Data: ${JSON.stringify(testCase.data, null, 2)}`);
      
      const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets?owner_id=${userId}`, {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('-'.repeat(50));
    }
  }
}

async function testFixedHeirCreation(token, userId) {
  console.log('\n🔧 Testing FIXED heir creation...\n');

  const heirData = {
    name: "Test Heir Fixed",
    relationship: "Spouse",
    email: "test.heir.fixed@example.com",
    phone: "+1234567890",
    notes: "API Test Heir - Fixed"
  };

  try {
    console.log('Testing fixed heir creation:');
    console.log(`Data: ${JSON.stringify(heirData, null, 2)}`);
    
    // Try without user_id in body, only in query params
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

async function fixCrownVault() {
  console.log('🔧 Starting Crown Vault Fix Session...');
  console.log('='.repeat(60));
  
  try {
    console.log('🔐 Logging in...');
    const { token, userId } = await login();
    console.log(`✅ Login successful. User ID: ${userId}`);
    
    await testFixedBatchProcessing(token, userId);
    await testFixedAssetCreation(token, userId);
    await testFixedHeirCreation(token, userId);
    
    console.log('\n🎯 Fix session complete!');
    
  } catch (error) {
    console.error('❌ Fix session failed:', error.message);
  }
}

fixCrownVault().catch(console.error);