// Test authentication flow
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testAuth() {
  try {
    console.log('🔐 Testing Authentication Flow\n');
    
    // Step 1: Login
    console.log('1. Attempting login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      console.log('   ✅ Login successful');
      const token = loginResponse.data.data.token;
      console.log('   Token (first 50 chars):', token.substring(0, 50) + '...');
      
      // Step 2: Test profile access
      console.log('\n2. Testing profile access with token...');
      const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profileResponse.data.success) {
        console.log('   ✅ Profile access successful');
        console.log('   User:', profileResponse.data.data.name);
        console.log('\n🎉 Authentication is working correctly!');
        console.log('\n📋 For Postman:');
        console.log('   Header Name: Authorization');
        console.log('   Header Value: Bearer ' + token);
      }
      
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 Possible causes:');
      console.log('   • Token format incorrect');
      console.log('   • Token expired'); 
      console.log('   • JWT secret mismatch');
      console.log('   • User not found in database');
    }
  }
}

testAuth();
