// test-heir-assignment-fixed.js - Test heir assignment with fixed mapping
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

async function testHeirAssignmentWithCorrectMapping() {
  try {
    const { token, userId } = await login();
    console.log(`User ID: ${userId}`);
    
    // Fetch heirs using the correct mapping
    console.log('\n👥 Fetching heirs...');
    const heirsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/heirs?owner_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const heirsData = await heirsResponse.json();
    console.log('Raw heirs data:', JSON.stringify(heirsData, null, 2));
    
    // Apply the correct mapping (like the API function does)
    const mappedHeirs = heirsData.map(heir => ({
      id: heir.id || heir.heir_id,
      name: heir.name,
      relationship: heir.relationship,
      email: heir.email,
      phone: heir.phone,
      notes: heir.notes,
      created_at: heir.created_at,
      ...heir
    }));
    
    console.log('\n📋 Mapped heirs:');
    mappedHeirs.forEach((heir, index) => {
      console.log(`Heir ${index + 1}:`);
      console.log(`  Name: ${heir.name}`);
      console.log(`  ID: ${heir.id}`);
      console.log('---');
    });
    
    // Fetch assets
    console.log('\n📋 Fetching assets...');
    const assetsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/detailed?owner_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const assetsData = await assetsResponse.json();
    
    if (mappedHeirs.length > 0 && assetsData.length > 0) {
      const testHeir = mappedHeirs[0];
      const testAsset = assetsData[0];
      
      console.log(`\n🎯 Testing assignment:`);
      console.log(`   Asset: ${testAsset.asset_data?.name || testAsset.asset_id}`);
      console.log(`   Heir: ${testHeir.name} (ID: ${testHeir.id})`);
      
      // Test heir assignment with correct ID
      const assignResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/${testAsset.asset_id}/heirs?owner_id=${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([testHeir.id])
      });

      const assignResponseText = await assignResponse.text();
      
      if (assignResponse.ok) {
        console.log(`✅ Heir assignment successful (${assignResponse.status})`);
        try {
          const jsonData = JSON.parse(assignResponseText);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('Response:', assignResponseText);
        }
      } else {
        console.log(`❌ Heir assignment failed (${assignResponse.status})`);
        try {
          const errorData = JSON.parse(assignResponseText);
          console.log('Error details:', JSON.stringify(errorData, null, 2));
        } catch (e) {
          console.log('Raw error:', assignResponseText);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testHeirAssignmentWithCorrectMapping().catch(console.error);