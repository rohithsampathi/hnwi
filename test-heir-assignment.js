// test-heir-assignment.js - Test heir assignment functionality
// Test user: rohith.sampathi@gmail.com Password123

const API_BASE_URL = "http://localhost:8000";

async function login() {
  try {
    console.log('🔐 Logging in with provided credentials...');
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
    
    if (!response.ok) {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }
    
    console.log('✅ Login successful');
    
    return {
      token: data.access_token || data.token,
      userId: data.user_id || data.user?.id || data.id
    };
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
}

async function fetchCurrentAssets(token, userId) {
  try {
    console.log('\n📋 Fetching current assets...');
    
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets/detailed?owner_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${JSON.stringify(data)}`);
    }

    console.log(`✅ Found ${data.length} assets`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch assets:', error);
    throw error;
  }
}

async function fetchCurrentHeirs(token, userId) {
  try {
    console.log('\n👥 Fetching current heirs...');
    
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/heirs?owner_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to fetch heirs: ${JSON.stringify(data)}`);
    }

    console.log(`✅ Found ${data.length} heirs`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch heirs:', error);
    throw error;
  }
}

async function testHeirAssignment(token, userId, assetId, heirIds) {
  try {
    console.log(`\n🔄 Testing heir assignment for asset ${assetId}...`);
    console.log(`   Assigning heir IDs: ${heirIds.join(', ')}`);
    
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets/${assetId}/heirs?owner_id=${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(heirIds) // Backend expects direct array
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ Heir assignment successful (${response.status})`);
      try {
        const jsonData = JSON.parse(responseText);
        console.log('Response:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('Response:', responseText);
      }
      return true;
    } else {
      console.log(`❌ Heir assignment failed (${response.status})`);
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('Raw error:', responseText);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error during heir assignment:', error);
    return false;
  }
}

async function testHeirAssignmentFlow() {
  console.log('🎯 Testing Heir Assignment Functionality...');
  console.log('='.repeat(70));
  
  try {
    // Step 1: Login
    const { token, userId } = await login();
    console.log(`User ID: ${userId}`);
    
    // Step 2: Fetch current assets
    const assets = await fetchCurrentAssets(token, userId);
    
    if (assets.length === 0) {
      console.log('⚠️  No assets found. Creating a test asset first...');
      
      // Create a test asset
      const createResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw_text: "Test heir assignment asset worth $10,000",
          structured_data: {
            name: "Test Asset for Heir Assignment",
            asset_type: "investment",
            value: 10000,
            currency: "USD"
          },
          context: "Test heir assignment"
        })
      });
      
      if (createResponse.ok) {
        console.log('✅ Test asset created');
        // Refetch assets
        const updatedAssets = await fetchCurrentAssets(token, userId);
        assets.push(...updatedAssets);
      } else {
        console.log('❌ Failed to create test asset');
        const error = await createResponse.text();
        console.log('Error:', error);
      }
    }
    
    // Step 3: Fetch current heirs
    const heirs = await fetchCurrentHeirs(token, userId);
    
    if (heirs.length === 0) {
      console.log('⚠️  No heirs found. Creating a test heir first...');
      
      // Create a test heir
      const createHeirResponse = await fetch(`${API_BASE_URL}/api/crown-vault/heirs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "Test Heir",
          relationship: "child",
          email: "test.heir@example.com",
          notes: "Test heir for assignment testing"
        })
      });
      
      if (createHeirResponse.ok) {
        console.log('✅ Test heir created');
        // Refetch heirs
        const updatedHeirs = await fetchCurrentHeirs(token, userId);
        heirs.push(...updatedHeirs);
      } else {
        console.log('❌ Failed to create test heir');
        const error = await createHeirResponse.text();
        console.log('Error:', error);
      }
    }
    
    // Step 4: Test heir assignment
    if (assets.length > 0 && heirs.length > 0) {
      const testAsset = assets[0];
      const testHeir = heirs[0];
      
      console.log(`\n🎯 Testing assignment:`);
      console.log(`   Asset: ${testAsset.asset_data?.name || testAsset.asset_id} (ID: ${testAsset.asset_id})`);
      console.log(`   Heir: ${testHeir.name} (ID: ${testHeir.id})`);
      
      const success = await testHeirAssignment(token, userId, testAsset.asset_id, [testHeir.id]);
      
      if (success) {
        console.log('\n🎉 Heir assignment test PASSED!');
        
        // Verify the assignment by fetching the asset again
        console.log('\n🔍 Verifying assignment...');
        const verifyResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/${testAsset.asset_id}/heirs?owner_id=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Assignment verified:', JSON.stringify(verifyData, null, 2));
        } else {
          console.log('⚠️  Could not verify assignment');
        }
      } else {
        console.log('\n❌ Heir assignment test FAILED!');
      }
    } else {
      console.log('\n⚠️  Cannot test heir assignment - missing assets or heirs');
      console.log(`   Assets: ${assets.length}, Heirs: ${heirs.length}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHeirAssignmentFlow().catch(console.error);