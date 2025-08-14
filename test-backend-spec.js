// test-backend-spec.js - Test with correct backend API specification

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
  console.log('\n📋 Testing SINGLE Asset Creation (Raw Text Only)...\n');

  const testCases = [
    {
      name: "Real Estate - Raw Text",
      data: {
        raw_text: "I own a luxury 3BHK apartment in Mumbai, Bandra West worth $500,000 USD. It has sea view and is fully furnished.",
        context: "Personal Real Estate"
      }
    },
    {
      name: "Stock Portfolio - Raw Text",
      data: {
        raw_text: "I have 100 shares of Apple stock (AAPL) worth $15,000 total, bought at $150 per share through Robinhood",
        context: "Investment Portfolio"
      }
    },
    {
      name: "Crypto Holdings - Raw Text", 
      data: {
        raw_text: "I own 0.5 Bitcoin stored in Coinbase wallet, current value approximately $25,000 USD",
        context: "Cryptocurrency Portfolio"
      }
    },
    {
      name: "Bonds - Raw Text",
      data: {
        raw_text: "US Treasury Bond worth $10,000, 10-year maturity, 3.5% yield, purchased from TD Ameritrade",
        context: "Fixed Income Investments"
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
  console.log('\n📋 Testing BATCH Asset Creation (Raw Text Only)...\n');

  const testCases = [
    {
      name: "Multiple assets - Raw Text Array",
      data: [
        {
          raw_text: "I have 100 shares of Apple stock worth $15,000, purchased through Robinhood at $150 per share",
          context: "Stock Portfolio"
        },
        {
          raw_text: "Tesla stock holdings: 50 shares worth $25,000, bought at $500 per share via E*TRADE",
          context: "Growth Stocks"
        }
      ]
    },
    {
      name: "Diverse asset portfolio - Raw Text",
      data: [
        {
          raw_text: "Bitcoin holdings: 0.8 BTC stored in Coinbase Pro, current value $40,000 USD",
          context: "Cryptocurrency"
        },
        {
          raw_text: "Gold ETF investment: 200 shares of SPDR Gold (GLD) worth $20,000 held at Fidelity",
          context: "Commodities"
        },
        {
          raw_text: "Real estate investment: Commercial property in Pune worth $200,000 USD, rental income $2,000/month",
          context: "Real Estate"
        }
      ]
    },
    {
      name: "Single comprehensive asset description",
      data: [
        {
          raw_text: "I own a diversified portfolio including: 2-bedroom condo in downtown Mumbai worth $300,000, 1000 shares of Microsoft at $250 each totaling $250,000, and savings account with $50,000 balance at HDFC Bank",
          context: "Complete Portfolio Overview"
        }
      ]
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
          console.log('Response Summary:');
          console.log(`- Assets Created: ${jsonData.assets?.length || 0}`);
          console.log(`- Total Value: $${jsonData.total_value || 0}`);
          console.log(`- Suggested Heirs: ${jsonData.suggested_heirs?.length || 0}`);
          if (jsonData.assets) {
            console.log('Asset Details:', JSON.stringify(jsonData.assets.map(a => ({
              id: a.asset_id,
              name: a.asset_data?.name,
              type: a.asset_data?.asset_type,
              value: a.asset_data?.value
            })), null, 2));
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

async function testBackendSpec() {
  console.log('🎯 Testing with CORRECT Backend API Specification...');
  console.log('='.repeat(70));
  
  try {
    console.log('🔐 Logging in...');
    const { token, userId } = await login();
    console.log(`✅ Login successful. User ID: ${userId}`);
    
    await testSingleAssetCreation(token, userId);
    await testBatchAssetCreation(token, userId);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBackendSpec().catch(console.error);