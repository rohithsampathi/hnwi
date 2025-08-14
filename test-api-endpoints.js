// test-api-endpoints.js - Comprehensive API endpoint testing script

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com";

// Performance monitoring
const performanceLog = [];

const logPerformance = (endpoint, method, startTime, endTime, status, success) => {
  const duration = endTime - startTime;
  performanceLog.push({
    endpoint,
    method,
    duration,
    status,
    success,
    timestamp: new Date().toISOString()
  });
  
  const statusColor = success ? '\x1b[32m' : '\x1b[31m'; // Green for success, red for failure
  const resetColor = '\x1b[0m';
  
  console.log(`${statusColor}${method} ${endpoint} - ${duration}ms - ${status}${resetColor}`);
};

// Helper function to make API calls with performance monitoring
async function testEndpoint(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, requireAuth = true } = options;
  
  const startTime = Date.now();
  let response, success = false, status = 'Unknown';
  
  try {
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add auth token if available and required
    if (requireAuth && global.authToken) {
      requestHeaders['Authorization'] = `Bearer ${global.authToken}`;
    }

    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    status = response.status;
    success = response.ok;
    
    const endTime = Date.now();
    logPerformance(endpoint, method, startTime, endTime, status, success);

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return { success: true, data, status };
      } else {
        const text = await response.text();
        return { success: true, data: text, status };
      }
    } else {
      const error = await response.text();
      return { success: false, error, status };
    }
  } catch (error) {
    const endTime = Date.now();
    logPerformance(endpoint, method, startTime, endTime, 'Network Error', false);
    return { success: false, error: error.message, status: 'Network Error' };
  }
}

// Test authentication endpoints
async function testAuthEndpoints() {
  console.log('\n🔐 Testing Authentication Endpoints...\n');
  
  // Test login endpoint with real credentials
  const loginResult = await testEndpoint('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'rohith.sampathi@gmail.com',
      password: 'Password123'
    },
    requireAuth: false
  });
  
  console.log('Login Endpoint:', loginResult.success ? '✅ Working' : `❌ Failed (${loginResult.status})`);

  // If login was successful, store the token and user ID
  if (loginResult.success && (loginResult.data.token || loginResult.data.access_token)) {
    global.authToken = loginResult.data.token || loginResult.data.access_token;
    global.userId = loginResult.data.user_id || loginResult.data.user?.id || loginResult.data.id;
    console.log('🔑 Auth token obtained for further testing');
    console.log(`👤 User ID: ${global.userId}`);
  } else if (loginResult.success) {
    console.log('⚠️  Login successful but no token found in response');
    console.log('Response data:', JSON.stringify(loginResult.data, null, 2));
  }
  
  return {
    login: loginResult.success
  };
}

// Test developments/elite pulse endpoints
async function testDevelopmentEndpoints() {
  console.log('\n💎 Testing Elite Pulse/Development Endpoints...\n');
  
  const developmentsResult = await testEndpoint('/api/developments', {
    method: 'POST',
    body: {
      page: 1,
      page_size: 5,
      sort_by: "date",
      sort_order: "desc"
    }
  });
  
  console.log('Developments:', developmentsResult.success ? '✅ Working' : `❌ Failed (${developmentsResult.error})`);
  
  return {
    developments: developmentsResult.success
  };
}

// Test opportunities endpoints
async function testOpportunityEndpoints() {
  console.log('\n💼 Testing Investment Opportunity Endpoints...\n');
  
  const opportunitiesResult = await testEndpoint('/api/opportunities');
  console.log('Opportunities List:', opportunitiesResult.success ? '✅ Working' : `❌ Failed (${opportunitiesResult.error})`);
  
  return {
    opportunities: opportunitiesResult.success
  };
}

// Test events endpoints
async function testEventEndpoints() {
  console.log('\n📅 Testing Social Events Endpoints...\n');
  
  const eventsResult = await testEndpoint('/api/events/');
  console.log('Events List:', eventsResult.success ? '✅ Working' : `❌ Failed (${eventsResult.error})`);
  
  return {
    events: eventsResult.success
  };
}

// Test crown vault endpoints (these require auth)
async function testCrownVaultEndpoints() {
  console.log('\n👑 Testing Crown Vault Endpoints...\n');
  
  // Use actual user ID from login
  const userId = global.userId || 'test-user-id';
  console.log(`Using User ID: ${userId}`);
  
  const assetsResult = await testEndpoint(`/api/crown-vault/assets/detailed?owner_id=${userId}`);
  console.log('Crown Vault Assets:', assetsResult.success ? '✅ Working' : `❌ Failed (${assetsResult.status})`);
  
  const heirsResult = await testEndpoint(`/api/crown-vault/heirs?owner_id=${userId}`);
  console.log('Crown Vault Heirs:', heirsResult.success ? '✅ Working' : `❌ Failed (${heirsResult.status})`);
  
  const statsResult = await testEndpoint(`/api/crown-vault/stats?owner_id=${userId}`);
  console.log('Crown Vault Stats:', statsResult.success ? '✅ Working' : `❌ Failed (${statsResult.status})`);
  
  // Test batch asset processing (POST operation)
  const batchResult = await testEndpoint(`/api/crown-vault/assets/batch?owner_id=${userId}`, {
    method: 'POST',
    body: {
      raw_text: "Test Asset: Real Estate Property in Mumbai worth $500,000",
      context: "API Test"
    }
  });
  console.log('Crown Vault Batch Processing:', batchResult.success ? '✅ Working' : `❌ Failed (${batchResult.status})`);
  
  return {
    assets: assetsResult.success,
    heirs: heirsResult.success,
    stats: statsResult.success,
    batchProcessing: batchResult.success
  };
}

// Test user profile endpoints - only test profile retrieval
async function testUserEndpoints() {
  console.log('\n👤 Testing User Profile Endpoints...\n');
  
  if (!global.userId) {
    console.log('⚠️  Skipping - No user ID available');
    return { profile: false };
  }
  
  // Test user profile retrieval
  const profileResult = await testEndpoint(`/api/users/${global.userId}`);
  console.log('User Profile Retrieval:', profileResult.success ? '✅ Working' : `❌ Failed (${profileResult.status})`);
  
  return {
    profile: profileResult.success
  };
}

// Generate performance summary
function generatePerformanceSummary() {
  console.log('\n📊 Performance Summary:\n');
  
  const avgTimes = {};
  const endpointCounts = {};
  
  performanceLog.forEach(log => {
    const key = `${log.method} ${log.endpoint}`;
    if (!avgTimes[key]) {
      avgTimes[key] = [];
      endpointCounts[key] = { success: 0, failure: 0 };
    }
    avgTimes[key].push(log.duration);
    
    if (log.success) {
      endpointCounts[key].success++;
    } else {
      endpointCounts[key].failure++;
    }
  });
  
  // Calculate averages
  Object.keys(avgTimes).forEach(endpoint => {
    const times = avgTimes[endpoint];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const counts = endpointCounts[endpoint];
    
    console.log(`${endpoint}:`);
    console.log(`  Average: ${avg.toFixed(0)}ms | Min: ${min}ms | Max: ${max}ms`);
    console.log(`  Success: ${counts.success} | Failures: ${counts.failure}`);
    console.log('');
  });
  
  // Overall summary
  const allTimes = performanceLog.map(log => log.duration);
  const totalAvg = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
  const successRate = (performanceLog.filter(log => log.success).length / performanceLog.length) * 100;
  
  console.log(`🎯 Overall Performance:`);
  console.log(`   Average Response Time: ${totalAvg.toFixed(0)}ms`);
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`   Total Requests: ${performanceLog.length}`);
  
  // Flag any slow endpoints (>2000ms)
  const slowEndpoints = performanceLog.filter(log => log.duration > 2000);
  if (slowEndpoints.length > 0) {
    console.log('\n⚠️  Slow Endpoints (>2s):');
    slowEndpoints.forEach(log => {
      console.log(`   ${log.method} ${log.endpoint} - ${log.duration}ms`);
    });
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Endpoint Testing...');
  console.log('='.repeat(60));
  
  const results = {};
  
  try {
    // Run all test suites
    results.auth = await testAuthEndpoints();
    results.developments = await testDevelopmentEndpoints();
    results.opportunities = await testOpportunityEndpoints();
    results.events = await testEventEndpoints();
    results.crownVault = await testCrownVaultEndpoints();
    results.users = await testUserEndpoints();
    
    // Generate performance summary
    generatePerformanceSummary();
    
    // Overall results summary
    console.log('\n🎯 Test Results Summary:');
    console.log('='.repeat(40));
    
    Object.keys(results).forEach(category => {
      const categoryResults = results[category];
      const workingEndpoints = Object.values(categoryResults).filter(Boolean).length;
      const totalEndpoints = Object.keys(categoryResults).length;
      
      console.log(`${category}: ${workingEndpoints}/${totalEndpoints} endpoints working`);
    });
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Global auth token and user ID storage
global.authToken = null;
global.userId = null;

// Run the tests
runAllTests().catch(console.error);