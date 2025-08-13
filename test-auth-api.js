// Authentication and API Testing Script
const API_BASE_URL = "https://uwind.onrender.com";

console.log("🔍 Starting Comprehensive Authentication & API Tests...\n");

// Test 1: Check if we can reach the API server
async function testApiConnectivity() {
  console.log("📡 Testing API Connectivity...");
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Server reachable");
      console.log("📄 CSRF Response:", JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log(`❌ API Server responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API Connectivity failed: ${error.message}`);
    return false;
  }
}

// Test 2: Test session endpoint without authentication
async function testSessionEndpoint() {
  console.log("\n🔐 Testing Session Endpoint...");
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`📊 Session Status: ${response.status}`);
    const text = await response.text();
    console.log("📄 Session Response:", text);
    
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Session test failed: ${error.message}`);
    return false;
  }
}

// Test 3: Test developments endpoint without authentication
async function testDevelopmentsNoAuth() {
  console.log("\n📊 Testing Developments Endpoint (No Auth)...");
  try {
    const response = await fetch(`${API_BASE_URL}/api/developments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 1,
        page_size: 3,
        sort_by: "date",
        sort_order: "desc"
      })
    });
    
    console.log(`📊 Developments Status: ${response.status}`);
    const data = await response.json();
    console.log("📄 Developments Response:", JSON.stringify(data, null, 2));
    
    if (response.status === 403) {
      console.log("🔍 Expected: Authentication required for developments");
      return true; // This is expected behavior
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Developments test failed: ${error.message}`);
    return false;
  }
}

// Test 4: Attempt login with test credentials
async function testLogin() {
  console.log("\n🔑 Testing Login Process...");
  
  // Common test credentials (these won't work but will show API response)
  const testCredentials = [
    { email: "test@example.com", password: "password123" },
    { email: "admin@hnwichronicles.com", password: "admin123" }
  ];
  
  for (const cred of testCredentials) {
    console.log(`🧪 Testing with: ${cred.email}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred)
      });
      
      console.log(`📊 Login Status: ${response.status}`);
      const data = await response.json();
      console.log("📄 Login Response:", JSON.stringify(data, null, 2));
      
      if (data.token) {
        console.log("✅ Token received! Testing with token...");
        await testWithToken(data.token);
        return true;
      }
    } catch (error) {
      console.log(`❌ Login test failed: ${error.message}`);
    }
  }
  
  return false;
}

// Test 5: Test API with a token (if we have one)
async function testWithToken(token) {
  console.log("\n🎫 Testing API with Token...");
  try {
    const response = await fetch(`${API_BASE_URL}/api/developments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        page: 1,
        page_size: 5,
        sort_by: "date",
        sort_order: "desc"
      })
    });
    
    console.log(`📊 Authenticated Developments Status: ${response.status}`);
    const data = await response.json();
    console.log("📄 Authenticated Response:", JSON.stringify(data, null, 2));
    
    if (data.developments && data.developments.length > 0) {
      console.log(`✅ SUCCESS: Found ${data.developments.length} developments!`);
      console.log("📋 Sample titles:");
      data.developments.slice(0, 3).forEach((dev, i) => {
        console.log(`   ${i + 1}. ${dev.title?.slice(0, 80)}...`);
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Authenticated test failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("=" .repeat(60));
  console.log("🎯 HNWI Chronicles API Authentication Test Suite");
  console.log("=" .repeat(60));
  
  const results = {
    connectivity: await testApiConnectivity(),
    session: await testSessionEndpoint(),
    developmentsNoAuth: await testDevelopmentsNoAuth(),
    login: await testLogin()
  };
  
  console.log("\n" + "=" .repeat(60));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=" .repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log("\n🔍 DIAGNOSIS:");
  if (results.connectivity && results.developmentsNoAuth) {
    console.log("✅ API server is working correctly");
    console.log("✅ Authentication is properly required");
    console.log("🔑 Issue: User needs to log in with valid credentials");
    console.log("💡 Solution: Use the Quick Login component in the debug panel");
  } else if (!results.connectivity) {
    console.log("❌ API server connectivity issues");
    console.log("🌐 Check network connection and API URL");
  } else {
    console.log("⚠️ Unexpected API behavior - needs investigation");
  }
  
  console.log("\n🛠️ NEXT STEPS:");
  console.log("1. Navigate to localhost:3004");
  console.log("2. Go to Strategy Vault page");
  console.log("3. Use 🔐 Test Auth Routes button");
  console.log("4. Use 🔑 Quick Login Test with valid credentials");
  console.log("5. Click 🛠️ Implement Fixes after login");
}

// Execute the tests
runAllTests().catch(console.error);