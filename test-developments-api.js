// Test script to directly call developments API and analyze response
const API_BASE_URL = 'https://uwind.onrender.com'; // External API

async function testDevelopmentsAPI() {
  console.log('🔍 Testing /api/developments endpoint...\n');
  
  // Test different time ranges
  const timeRanges = ['1d', '1w', '1m', '6m'];
  
  for (const timeRange of timeRanges) {
    console.log(`\n📅 Testing time_range: ${timeRange}`);
    console.log('=' .repeat(50));
    
    try {
      const requestBody = {
        start_date: null,
        end_date: null,
        industry: undefined,
        product: null,
        page: 1,
        page_size: 10, // Small number for testing
        sort_by: "date",
        sort_order: "desc",
        time_range: timeRange,
      };
      
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/api/developments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed - you'll need to get this from browser
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ API Error:', response.statusText);
        continue;
      }
      
      const data = await response.json();
      console.log('📦 Response structure:');
      console.log('  - Type:', typeof data);
      console.log('  - Keys:', Object.keys(data));
      
      if (data.developments) {
        console.log('  - developments count:', data.developments.length);
        console.log('  - First development sample:');
        if (data.developments[0]) {
          const sample = data.developments[0];
          console.log('    - id:', sample.id);
          console.log('    - title:', sample.title?.substring(0, 50) + '...');
          console.log('    - industry:', sample.industry);
          console.log('    - date:', sample.date);
          console.log('    - All fields:', Object.keys(sample));
        }
      }
      
      if (data.data) {
        console.log('  - data field exists with length:', data.data?.length);
      }
      
    } catch (error) {
      console.error('❌ Error testing', timeRange, ':', error.message);
    }
  }
}

// Run the test
testDevelopmentsAPI();