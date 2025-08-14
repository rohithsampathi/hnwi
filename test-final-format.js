// test-final-format.js - Test with the final correct backend format

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

async function testSingleAssetCreation(token, userId) {
  console.log('\n📋 Testing SINGLE Asset Creation - Final Format...\n');

  const testCases = [
    {
      name: "Raw text only",
      data: {
        raw_text: "I have 100 shares of Apple stock worth $15,000, bought at $150 per share through Robinhood",
        context: "Investment portfolio"
      }
    },
    {
      name: "Structured data only",
      data: {
        structured_data: {
          name: "Apple Stock",
          asset_type: "stocks",
          value: 15000,
          currency: "USD",
          unit_count: 100,
          unit_type: "shares",
          cost_per_unit: 150
        },
        context: "Investment portfolio"
      }
    },
    {
      name: "Both raw_text AND structured_data",
      data: {
        raw_text: "I have 100 shares of Apple stock worth $15,000",
        structured_data: {
          name: "Apple Stock",
          asset_type: "stocks",
          value: 15000,
          currency: "USD",
          unit_count: 100,
          unit_type: "shares",
          cost_per_unit: 150
        },
        context: "Investment portfolio"
      }
    },
    {
      name: "Real estate with both formats",
      data: {
        raw_text: "Luxury 3BHK apartment in Mumbai, Bandra West with sea view worth $500,000",
        structured_data: {
          name: "Mumbai Sea View Apartment",
          asset_type: "real_estate",
          value: 500000,
          currency: "USD",
          location: "Mumbai, Bandra West",
          notes: "3BHK luxury apartment with sea view"
        },
        context: "Personal Real Estate"
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Data: ${JSON.stringify(testCase.data, null, 2)}`);
      
      const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets`, {
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
          console.log('Asset ID:', jsonData);
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

async function testBatchAssetCreation(token, userId) {
  console.log('\n📋 Testing BATCH Asset Creation - Final Format...\n');

  const testCases = [
    {
      name: "Mixed: raw_text only, structured_data only, and both",
      data: [
        {
          raw_text: "Tesla stock - 50 shares at $500 each, total value $25,000"
        },
        {
          structured_data: {
            name: "Microsoft Stock",
            asset_type: "stocks",
            value: 30000,
            currency: "USD",
            unit_count: 100,
            unit_type: "shares",
            cost_per_unit: 300
          },
          context: "Tech Stocks"
        },
        {
          raw_text: "Bitcoin holdings worth approximately $40,000",
          structured_data: {
            name: "Bitcoin Portfolio",
            asset_type: "crypto",
            value: 40000,
            currency: "USD",
            unit_count: 0.8,
            unit_type: "BTC",
            cost_per_unit: 50000
          },
          context: "Cryptocurrency"
        }
      ]
    },
    {
      name: "Diverse portfolio with heir assignments",
      data: [
        {
          raw_text: "Real estate investment: 2-bedroom condo in downtown Mumbai worth $300,000",
          structured_data: {
            name: "Mumbai Downtown Condo",
            asset_type: "real_estate",
            value: 300000,
            currency: "USD",
            location: "Mumbai Downtown",
            notes: "2-bedroom luxury condo"
          },
          context: "Real Estate Portfolio"
        },
        {
          raw_text: "US Treasury Bonds worth $50,000 with 3.5% annual yield",
          structured_data: {
            name: "US Treasury Bonds",
            asset_type: "bonds",
            value: 50000,
            currency: "USD",
            growth_rate: 3.5,
            maturity_date: "2030-12-31"
          },
          context: "Fixed Income"
        }
      ]
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
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
          console.log('Batch Response Summary:');
          console.log(`- Assets Created: ${jsonData.assets?.length || 0}`);
          console.log(`- Total Value: $${jsonData.total_value || 0}`);
          console.log(`- Suggested Heirs: ${jsonData.suggested_heirs?.length || 0}`);
          if (jsonData.assets && jsonData.assets.length > 0) {
            console.log('Asset Details:');
            jsonData.assets.slice(0, 3).forEach((asset, i) => {
              console.log(`  ${i + 1}. ${asset.asset_data?.name || 'Unnamed'} - $${asset.asset_data?.value || 0}`);
            });
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('-'.repeat(60));
    }
  }
}

async function testFinalFormat() {
  console.log('🎯 Testing Crown Vault with FINAL CORRECT Format...');
  console.log('='.repeat(70));
  
  try {
    console.log('🔐 Logging in...');
    const { token, userId } = await login();
    console.log(`✅ Login successful. User ID: ${userId}`);
    
    await testSingleAssetCreation(token, userId);
    await testBatchAssetCreation(token, userId);
    
    console.log('\n🎉 Final format testing completed!');
    console.log('Once backend is fixed to handle authentication properly,');
    console.log('these are the exact formats that should work.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFinalFormat().catch(console.error);