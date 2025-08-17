// test-frontend-heir-assignment.js - Test frontend heir assignment after fixes
const API_BASE_URL = "http://localhost:3000"; // Frontend API

async function testFrontendHeirAssignment() {
  try {
    console.log('🎯 Testing frontend heir assignment after Bearer token fixes...');
    
    // Login through frontend to establish session
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
    
    // Extract session cookie
    const cookies = loginResponse.headers.get('set-cookie');
    const cookieHeader = cookies ? cookies.split(',').map(cookie => cookie.split(';')[0]).join('; ') : '';
    
    console.log('✅ Frontend login successful');
    
    // Test assets fetch to ensure API is working
    console.log('\n📋 Testing assets fetch through frontend...');
    const assetsResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      }
    });

    if (assetsResponse.ok) {
      const assets = await assetsResponse.json();
      console.log(`✅ Assets fetch successful: ${assets.length} assets`);
      
      if (assets.length > 0) {
        const testAsset = assets[0];
        console.log(`Test asset: ${testAsset.asset_data?.name} (${testAsset.asset_id})`);
        
        // Now test heir assignment through frontend API
        console.log('\n🎯 Testing heir assignment through frontend API...');
        
        // First, try assigning to first heir ID from our earlier test
        const heirId = '6895e1003aa803939c61014e'; // Katya Sampathi from backend test
        
        const assignResponse = await fetch(`${API_BASE_URL}/api/crown-vault/assets/${testAsset.asset_id}/heirs`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
          },
          body: JSON.stringify({ heir_ids: [heirId] })
        });

        if (assignResponse.ok) {
          const assignData = await assignResponse.json();
          console.log('✅ Frontend heir assignment successful!');
          console.log('Assigned to:', assignData.heir_names);
        } else {
          const error = await assignResponse.text();
          console.log('❌ Frontend heir assignment failed:', error);
        }
      }
    } else {
      const error = await assetsResponse.text();
      console.log('❌ Assets fetch failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendHeirAssignment().catch(console.error);