// Find available issues for testing
require('dotenv').config();

const express = require('express');
const app = express();

// Import database connection
const { prisma } = require('./src/config/database');

async function findAvailableIssues() {
  try {
    console.log('🔍 Searching for available issues...\n');
    
    // Get all issues
    const issues = await prisma.issue.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        priority: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (issues.length === 0) {
      console.log('❌ No issues found in database');
      console.log('\n💡 You need to create an issue first!');
      console.log('   Use Test 8: Create Issue in Postman');
      console.log('   Then come back to test admin status update');
    } else {
      console.log(`✅ Found ${issues.length} issue(s):\n`);
      
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. Issue ID: ${issue.id}`);
        console.log(`   Title: ${issue.title}`);
        console.log(`   Status: ${issue.status}`);
        console.log(`   Priority: ${issue.priority}`);
        console.log(`   Created by: ${issue.user.name} (${issue.user.email})`);
        console.log(`   Created: ${issue.createdAt}`);
        console.log('');
      });

      console.log('🔧 For Test 15 (Admin Update Status):');
      console.log(`   URL: {{baseUrl}}/api/admin/issues/${issues[0].id}/status`);
      console.log('   Method: PATCH');
      console.log('   Headers: Authorization: Bearer {{adminToken}}');
      console.log('   Body: { "status": "IN_PROGRESS" }');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

findAvailableIssues();
