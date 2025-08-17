// test-heir-assignment-final.js - Test the fixed heir assignment functionality
const API_BASE_URL = "http://localhost:3000"; // Frontend API

async function testFrontendHeirAssignment() {
  try {
    console.log('🎯 Testing fixed heir assignment through frontend API...');
    
    // Login first to get session
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'rohith.sampathi@gmail.com',
        password: 'Password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    console.log('✅ Login successful');

    // Test heirs fetch through frontend API
    console.log('\n👥 Testing heirs fetch through frontend API...');
    const heirsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/heirs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (heirsResponse.ok) {
      const heirsData = await heirsResponse.json();
      console.log('Frontend heirs response:', JSON.stringify(heirsData, null, 2));
      
      // Test assets fetch
      console.log('\n📋 Testing assets fetch...');
      const assetsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json();
        console.log(`Found ${assetsData.length} assets`);
        
        if (heirsData.heirs && heirsData.heirs.length > 0 && assetsData.length > 0) {
          const testHeir = heirsData.heirs[0];
          const testAsset = assetsData[0];
          
          console.log(`\n🎯 Testing assignment:`);
          console.log(`   Asset: ${testAsset.asset_data?.name || testAsset.asset_id}`);
          console.log(`   Heir: ${testHeir.name} (ID: ${testHeir.id})`);
          
          // Test heir assignment through frontend API
          const assignResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/${testAsset.asset_id}/heirs`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ heir_ids: [testHeir.id] })
          });

          if (assignResponse.ok) {
            const assignData = await assignResponse.json();
            console.log('✅ Heir assignment successful!');
            console.log('Response:', JSON.stringify(assignData, null, 2));
          } else {
            const error = await assignResponse.text();
            console.log('❌ Heir assignment failed:', error);
          }
        } else {
          console.log('⚠️  Missing heirs or assets for testing');
        }
      } else {
        console.log('❌ Failed to fetch assets');
      }
    } else {
      const error = await heirsResponse.text();
      console.log('❌ Failed to fetch heirs:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendHeirAssignment().catch(console.error);