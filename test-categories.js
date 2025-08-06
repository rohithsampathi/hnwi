// Simple test script to verify category improvements
const { processAssetCategories, getCategoryGroup, getCategoryDisplayName } = require('./lib/category-utils.ts');

// Test data simulating various asset types
const testAssets = [
  { asset_data: { asset_type: 'real_estate', value: 500000 } },
  { asset_data: { asset_type: 'land', value: 200000 } },
  { asset_data: { asset_type: 'property', value: 300000 } },
  { asset_data: { asset_type: 'jewelry', value: 50000 } },
  { asset_data: { asset_type: 'precious_metals', value: 75000 } },
  { asset_data: { asset_type: 'gold', value: 25000 } },
  { asset_data: { asset_type: 'vehicle', value: 80000 } },
  { asset_data: { asset_type: 'car', value: 60000 } },
  { asset_data: { asset_type: 'crypto', value: 100000 } },
  { asset_data: { asset_type: 'bitcoin', value: 150000 } },
  { asset_data: { asset_type: 'stocks', value: 400000 } },
  { asset_data: { asset_type: 'business', value: 1000000 } }
];

console.log('=== CATEGORY IMPROVEMENTS TEST ===\n');

console.log('1. Testing Category Grouping:');
testAssets.forEach(asset => {
  const original = asset.asset_data.asset_type;
  const grouped = getCategoryGroup(original);
  const display = getCategoryDisplayName(grouped);
  console.log(`  ${original} → ${grouped} → "${display}"`);
});

console.log('\n2. Testing Processed Categories:');
const processed = processAssetCategories(testAssets);
processed.forEach(category => {
  console.log(`  ${category.name}: "${category.displayName}" - $${category.value.toLocaleString()} (${category.count} assets, ${category.percentage}%)`);
});

console.log('\n3. Expected Improvements:');
console.log('  ✓ real_estate, land, property → Real Estate & Property');
console.log('  ✓ jewelry, precious_metals, gold → Jewelry & Precious Metals'); 
console.log('  ✓ vehicle, car → Vehicles & Transportation');
console.log('  ✓ crypto, bitcoin → Cryptocurrency & Digital Assets');
console.log('  ✓ Better display names instead of raw API values');
console.log('  ✓ Grouped related categories to reduce fragmentation');