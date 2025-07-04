// Debug token issues
require('dotenv').config();
const { generateToken, verifyToken } = require('./src/utils/jwt');

console.log('🔍 JWT Debug Tool\n');

// Test 1: Check environment
console.log('1. Environment Check:');
console.log('   JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('   JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('   JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);

// Test 2: Generate a test token
console.log('\n2. Generate Test Token:');
try {
  const testPayload = { userId: 1, email: 'test@example.com' };
  const testToken = generateToken(testPayload);
  console.log('   ✅ Token generated successfully');
  console.log('   Token:', testToken.substring(0, 50) + '...');
  
  // Test 3: Verify the token
  console.log('\n3. Verify Test Token:');
  const decoded = verifyToken(testToken);
  console.log('   ✅ Token verified successfully');
  console.log('   Decoded payload:', decoded);
  
  // Test 4: Check token expiration
  console.log('\n4. Token Expiration:');
  const now = Math.floor(Date.now() / 1000);
  const timeToExpire = decoded.exp - now;
  console.log('   Current time:', now);
  console.log('   Token expires at:', decoded.exp);
  console.log('   Time to expire (seconds):', timeToExpire);
  console.log('   Time to expire (days):', Math.round(timeToExpire / 86400));
  
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Test 5: Sample correct format
console.log('\n5. Correct Token Format for Postman:');
console.log('   Header Name: Authorization');
console.log('   Header Value: Bearer YOUR_TOKEN_HERE');
console.log('   Example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

console.log('\n🔧 Debugging Steps for Postman:');
console.log('1. Login first to get a fresh token');
console.log('2. Copy the token from login response');
console.log('3. Add Authorization header: Bearer <token>');
console.log('4. Make sure there is a space after "Bearer"');
console.log('5. Check token is not expired');
