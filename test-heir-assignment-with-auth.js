// test-heir-assignment-with-auth.js - Test with proper authentication
const API_BASE_URL = "http://localhost:3000"; // Frontend API

async function testWithProperAuth() {
  try {
    console.log('🎯 Testing heir assignment with proper session auth...');
    
    // Login and capture cookies
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
    
    // Extract cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful');
    console.log('Cookies:', cookies);

    // Use cookies for subsequent requests
    const cookieHeader = cookies ? cookies.split(',').map(cookie => cookie.split(';')[0]).join('; ') : '';
    
    // Test heirs fetch with proper auth
    console.log('\n👥 Testing heirs fetch with session auth...');
    const heirsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/heirs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      }
    });

    if (heirsResponse.ok) {
      const heirsData = await heirsResponse.json();
      console.log('✅ Heirs fetch successful!');
      console.log('Heirs count:', heirsData.heirs?.length || 0);
      
      if (heirsData.heirs && heirsData.heirs.length > 0) {
        console.log('First heir:', {
          id: heirsData.heirs[0].id,
          name: heirsData.heirs[0].name
        });
        
        // Test assets fetch
        console.log('\n📋 Testing assets fetch...');
        const assetsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
          }
        });

        if (assetsResponse.ok) {
          const assetsData = await assetsResponse.json();
          console.log(`✅ Found ${assetsData.length} assets`);
          
          if (assetsData.length > 0) {
            const testHeir = heirsData.heirs[0];
            const testAsset = assetsData[0];
            
            console.log(`\n🎯 Testing heir assignment:`);
            console.log(`   Asset: ${testAsset.asset_data?.name || testAsset.asset_id}`);
            console.log(`   Heir: ${testHeir.name} (ID: ${testHeir.id})`);
            
            // Test heir assignment with proper auth
            const assignResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/${testAsset.asset_id}/heirs`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader
              },
              body: JSON.stringify({ heir_ids: [testHeir.id] })
            });

            if (assignResponse.ok) {
              const assignData = await assignResponse.json();
              console.log('✅ Heir assignment successful!');
              console.log('Assigned heir names:', assignData.heir_names);
              
              // Verify by fetching the asset again
              console.log('\n🔍 Verifying assignment...');
              const verifyResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/${testAsset.asset_id}/heirs`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Cookie': cookieHeader
                }
              });
              
              if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json();
                console.log('✅ Assignment verified!');
                console.log('Current heir assignment:', verifyData);
              } else {
                console.log('⚠️  Could not verify assignment');
              }
              
            } else {
              const error = await assignResponse.text();
              console.log('❌ Heir assignment failed:', error);
            }
          }
        } else {
          const error = await assetsResponse.text();
          console.log('❌ Failed to fetch assets:', error);
        }
      }
    } else {
      const error = await heirsResponse.text();
      console.log('❌ Failed to fetch heirs:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWithProperAuth().catch(console.error);