// test-heir-assignment-bearer.js - Test with Bearer token authentication
const API_BASE_URL = "http://localhost:8000"; // Backend API directly

async function testHeirAssignmentWithBearer() {
  try {
    console.log('🎯 Testing heir assignment with Bearer token...');
    
    // Step 1: Login to get Bearer token
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
    
    const loginData = await loginResponse.json();
    const accessToken = loginData.access_token;
    const userId = loginData.user_id;
    
    console.log('✅ Login successful');
    console.log(`User ID: ${userId}`);
    
    // Step 2: Fetch heirs using Bearer token
    console.log('\n👥 Fetching heirs with Bearer token...');
    const heirsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/heirs?owner_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!heirsResponse.ok) {
      const error = await heirsResponse.text();
      console.log('❌ Failed to fetch heirs:', error);
      return;
    }
    
    const heirs = await heirsResponse.json();
    console.log(`✅ Found ${heirs.length} heirs`);
    
    if (heirs.length > 0) {
      console.log('Heirs:', heirs.map(h => ({ id: h.heir_id, name: h.name })));
    }
    
    // Step 3: Fetch assets
    console.log('\n📋 Fetching assets...');
    const assetsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/detailed?owner_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!assetsResponse.ok) {
      const error = await assetsResponse.text();
      console.log('❌ Failed to fetch assets:', error);
      return;
    }
    
    const assets = await assetsResponse.json();
    console.log(`✅ Found ${assets.length} assets`);
    
    // Step 4: Test heir assignment
    if (heirs.length > 0 && assets.length > 0) {
      const testHeir = heirs[0];
      const testAsset = assets[0];
      
      console.log(`\n🎯 Testing heir assignment:`);
      console.log(`   Asset: ${testAsset.asset_data?.name || testAsset.asset_id}`);
      console.log(`   Heir: ${testHeir.name} (ID: ${testHeir.heir_id})`);
      
      // Test heir assignment using Bearer token
      const assignResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/${testAsset.asset_id}/heirs?owner_id=${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([testHeir.heir_id]) // Backend expects direct array
      });

      if (assignResponse.ok) {
        const assignData = await assignResponse.json();
        console.log('✅ Heir assignment successful!');
        console.log('Response:', JSON.stringify(assignData, null, 2));
        
        // Step 5: Verify assignment
        console.log('\n🔍 Verifying assignment...');
        const verifyResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/detailed?owner_id=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (verifyResponse.ok) {
          const updatedAssets = await verifyResponse.json();
          const updatedAsset = updatedAssets.find(a => a.asset_id === testAsset.asset_id);
          
          if (updatedAsset) {
            console.log('✅ Assignment verified!');
            console.log(`Asset now assigned to: ${updatedAsset.heir_names?.join(', ') || 'None'}`);
          }
        }
        
      } else {
        const error = await assignResponse.text();
        console.log('❌ Heir assignment failed:', error);
      }
    } else {
      console.log('⚠️  Missing heirs or assets for testing');
      console.log(`   Heirs: ${heirs.length}, Assets: ${assets.length}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testHeirAssignmentWithBearer().catch(console.error);