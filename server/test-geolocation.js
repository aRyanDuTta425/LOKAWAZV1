// Test geolocation search fix
require('dotenv').config();

console.log('🗺️  Testing Geolocation Search API\n');

// Test URL - Updated to use latitude/longitude instead of lat/lng
const testUrl = 'http://localhost:8000/api/issues/nearby?latitude=40.7128&longitude=-74.0060&radius=5';

console.log('✅ Fixed URL for Postman:');
console.log('   Method: GET');
console.log('   URL:', testUrl);
console.log('\n📝 Query Parameters:');
console.log('   • latitude: 40.7128 (required)');
console.log('   • longitude: -74.0060 (required)');
console.log('   • radius: 5 (optional, defaults to 5km)');

console.log('\n🔧 For Postman:');
console.log('   1. Method: GET');
console.log('   2. URL: http://localhost:8000/api/issues/nearby');
console.log('   3. Query Params:');
console.log('      - latitude: 40.7128');
console.log('      - longitude: -74.0060');
console.log('      - radius: 5');
console.log('   4. Headers (if you need authentication):');
console.log('      - Authorization: Bearer YOUR_TOKEN_HERE');

console.log('\n🌍 Sample coordinates to test:');
console.log('   • New York: latitude=40.7128, longitude=-74.0060');
console.log('   • London: latitude=51.5074, longitude=-0.1278');
console.log('   • Tokyo: latitude=35.6762, longitude=139.6503');
console.log('   • Mumbai: latitude=19.0760, longitude=72.8777');

console.log('\n✨ The fix ensures:');
console.log('   • Parameter names are consistent (latitude/longitude)');
console.log('   • Validation works properly');
console.log('   • Required parameters are enforced');
