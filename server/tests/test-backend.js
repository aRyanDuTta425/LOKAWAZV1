#!/usr/bin/env node

// Comprehensive Backend Test Script
// This script tests all components of the Lok Awaaz backend

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:8000';
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!'
};

const TEST_ADMIN = {
  name: 'Test Admin',
  email: 'admin@example.com',
  password: 'AdminPassword123!'
};

const TEST_ISSUE = {
  title: 'Test Street Light Issue',
  description: 'Street light not working on Main Street',
  latitude: 28.6139,
  longitude: 77.2090,
  category: 'Infrastructure',
  priority: 'MEDIUM'
};

let userToken = '';
let adminToken = '';
let userId = '';
let issueId = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');
const logTest = (message) => log(`🧪 ${message}`, 'cyan');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test runner
async function runTest(testName, testFunction) {
  try {
    logTest(`Running: ${testName}`);
    await testFunction();
    logSuccess(`Passed: ${testName}`);
    return true;
  } catch (error) {
    logError(`Failed: ${testName}`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

// Individual test functions
async function testServerHealth() {
  const response = await axios.get(`${BASE_URL}/health`);
  if (response.status !== 200) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  if (!response.data.success) {
    throw new Error('Health check returned success: false');
  }
}

async function testDatabaseConnection() {
  // Test database connection through a simple API call
  const response = await axios.get(`${BASE_URL}/api`);
  if (response.status !== 200) {
    throw new Error(`API root failed with status ${response.status}`);
  }
}

async function testUserRegistration() {
  const response = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
  if (response.status !== 201) {
    throw new Error(`Registration failed with status ${response.status}`);
  }
  if (!response.data.data.token) {
    throw new Error('No token returned from registration');
  }
  userToken = response.data.data.token;
  userId = response.data.data.user.id;
}

async function testAdminRegistration() {
  const adminData = { ...TEST_ADMIN, role: 'ADMIN' };
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, adminData);
    adminToken = response.data.data.token;
  } catch (error) {
    // If admin registration fails, try to login instead
    if (error.response?.status === 409) {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_ADMIN.email,
        password: TEST_ADMIN.password
      });
      adminToken = loginResponse.data.data.token;
    } else {
      throw error;
    }
  }
}

async function testUserLogin() {
  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}`);
  }
  if (!response.data.data.token) {
    throw new Error('No token returned from login');
  }
}

async function testAuthProtectedRoute() {
  const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  if (response.status !== 200) {
    throw new Error(`Protected route failed with status ${response.status}`);
  }
  if (response.data.data.email !== TEST_USER.email) {
    throw new Error('Protected route returned wrong user data');
  }
}

async function testCreateIssue() {
  const response = await axios.post(`${BASE_URL}/api/issues`, TEST_ISSUE, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  if (response.status !== 201) {
    throw new Error(`Issue creation failed with status ${response.status}`);
  }
  if (!response.data.data.id) {
    throw new Error('No issue ID returned from creation');
  }
  issueId = response.data.data.id;
}

async function testGetIssues() {
  const response = await axios.get(`${BASE_URL}/api/issues`);
  if (response.status !== 200) {
    throw new Error(`Get issues failed with status ${response.status}`);
  }
  if (!Array.isArray(response.data.data)) {
    throw new Error('Issues response is not an array');
  }
}

async function testGetIssueById() {
  const response = await axios.get(`${BASE_URL}/api/issues/${issueId}`);
  if (response.status !== 200) {
    throw new Error(`Get issue by ID failed with status ${response.status}`);
  }
  if (response.data.data.title !== TEST_ISSUE.title) {
    throw new Error('Issue data does not match');
  }
}

async function testUpdateIssue() {
  const updateData = {
    title: 'Updated Test Issue',
    description: 'Updated description'
  };
  const response = await axios.put(`${BASE_URL}/api/issues/${issueId}`, updateData, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  if (response.status !== 200) {
    throw new Error(`Issue update failed with status ${response.status}`);
  }
  if (response.data.data.title !== updateData.title) {
    throw new Error('Issue was not updated correctly');
  }
}

async function testAdminStatusUpdate() {
  const response = await axios.patch(`${BASE_URL}/api/issues/${issueId}/status`, 
    { status: 'IN_PROGRESS' },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  if (response.status !== 200) {
    throw new Error(`Admin status update failed with status ${response.status}`);
  }
}

async function testGetUsers() {
  const response = await axios.get(`${BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (response.status !== 200) {
    throw new Error(`Get users failed with status ${response.status}`);
  }
}

async function testNearbyIssues() {
  const response = await axios.get(`${BASE_URL}/api/issues/nearby?lat=28.6139&lng=77.2090&radius=10`);
  if (response.status !== 200) {
    throw new Error(`Nearby issues failed with status ${response.status}`);
  }
}

async function testIssueStatistics() {
  const response = await axios.get(`${BASE_URL}/api/issues/stats`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  if (response.status !== 200) {
    throw new Error(`Issue statistics failed with status ${response.status}`);
  }
}

async function testRateLimiting() {
  // Test rate limiting by making multiple requests quickly
  const requests = Array(10).fill().map(() => 
    axios.get(`${BASE_URL}/api/issues`).catch(err => err.response)
  );
  
  const responses = await Promise.all(requests);
  // All should succeed since we're under the limit
  const allSuccessful = responses.every(res => res.status === 200);
  if (!allSuccessful) {
    throw new Error('Rate limiting test failed - unexpected responses');
  }
}

async function testCORS() {
  // Test CORS headers
  const response = await axios.options(`${BASE_URL}/api/issues`, {
    headers: {
      'Origin': 'http://localhost:3000'
    }
  });
  if (!response.headers['access-control-allow-origin'] && !response.headers['access-control-allow-credentials']) {
    throw new Error('CORS headers not present');
  }
}

async function testValidationErrors() {
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, {
      name: '', // Invalid name
      email: 'invalid-email',
      password: '123' // Too short
    });
    throw new Error('Validation should have failed');
  } catch (error) {
    if (error.response?.status !== 400) {
      throw new Error(`Expected 400 validation error, got ${error.response?.status}`);
    }
  }
}

async function testUnauthorizedAccess() {
  try {
    await axios.get(`${BASE_URL}/api/auth/profile`);
    throw new Error('Should require authentication');
  } catch (error) {
    if (error.response?.status !== 401) {
      throw new Error(`Expected 401 unauthorized, got ${error.response?.status}`);
    }
  }
}

async function testDeleteIssue() {
  const response = await axios.delete(`${BASE_URL}/api/issues/${issueId}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  if (response.status !== 200) {
    throw new Error(`Issue deletion failed with status ${response.status}`);
  }
}

// Cleanup function
async function cleanup() {
  try {
    // Delete test user
    if (userToken) {
      await axios.delete(`${BASE_URL}/api/auth/account`, {
        headers: { Authorization: `Bearer ${userToken}` },
        data: { password: TEST_USER.password }
      });
    }
  } catch (error) {
    logWarning('Cleanup failed, but that\'s okay for testing');
  }
}

// Main test runner
async function runAllTests() {
  log('\n🚀 Starting Lok Awaaz Backend Tests\n', 'magenta');
  
  const tests = [
    { name: 'Server Health Check', func: testServerHealth },
    { name: 'Database Connection', func: testDatabaseConnection },
    { name: 'User Registration', func: testUserRegistration },
    { name: 'Admin Registration', func: testAdminRegistration },
    { name: 'User Login', func: testUserLogin },
    { name: 'Auth Protected Route', func: testAuthProtectedRoute },
    { name: 'Create Issue', func: testCreateIssue },
    { name: 'Get All Issues', func: testGetIssues },
    { name: 'Get Issue by ID', func: testGetIssueById },
    { name: 'Update Issue', func: testUpdateIssue },
    { name: 'Admin Status Update', func: testAdminStatusUpdate },
    { name: 'Get Users (Admin)', func: testGetUsers },
    { name: 'Nearby Issues Search', func: testNearbyIssues },
    { name: 'Issue Statistics', func: testIssueStatistics },
    { name: 'Rate Limiting', func: testRateLimiting },
    { name: 'CORS Headers', func: testCORS },
    { name: 'Validation Errors', func: testValidationErrors },
    { name: 'Unauthorized Access', func: testUnauthorizedAccess },
    { name: 'Delete Issue', func: testDeleteIssue },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await runTest(test.name, test.func);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await delay(500); // Small delay between tests
  }

  // Cleanup
  logInfo('Running cleanup...');
  await cleanup();

  // Results
  log('\n📊 Test Results:', 'magenta');
  logSuccess(`Passed: ${passed}`);
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  }
  
  const totalTests = passed + failed;
  const successRate = ((passed / totalTests) * 100).toFixed(1);
  
  if (failed === 0) {
    logSuccess(`🎉 All tests passed! (${successRate}%)`);
  } else {
    logWarning(`⚠️  ${failed} test(s) failed. Success rate: ${successRate}%`);
  }

  log('\n✨ Backend testing completed!', 'magenta');
  
  return failed === 0;
}

// Check if server is running
async function checkServerStatus() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  logInfo('Checking if server is running...');
  
  const isRunning = await checkServerStatus();
  
  if (!isRunning) {
    logError('Server is not running!');
    logInfo(`Please start the server first: cd server && npm run dev`);
    logInfo(`Server should be running on: ${BASE_URL}`);
    process.exit(1);
  }
  
  logSuccess('Server is running!');
  
  const success = await runAllTests();
  process.exit(success ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  logError('Unhandled promise rejection:');
  console.error(error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  checkServerStatus
};
