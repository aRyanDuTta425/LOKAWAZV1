
// server/test-db.js
// This script tests the database connection and retrieves users from the database.
// const { connectDB, disconnectDB, prisma } = require('./src/config/database');

// (async () => {
//   try {
//     console.log('⏳ Connecting to DB...');
//     await connectDB();

//     console.log('✅ Connected! Running test query...');
//     const users = await prisma.user.findMany();

//     if (users.length === 0) {
//       console.log('ℹ️ No users found in database.');
//     } else {
//       console.log('📄 Users:', users);
//     }

//     console.log('⏳ Disconnecting...');
//     await disconnectDB();
//     console.log('✅ Disconnected successfully.');
//   } catch (err) {
//     console.error('❌ Test failed:', err);
//   }
// })();



// server/src/utils/jwt.js
//testing JWT utilities

require('dotenv').config(); // Load .env variables

const { generateToken, verifyToken, extractToken } = require('../src/utils/jwt');

const payload = {
  id: 'user123',
  role: 'USER',
};

const token = generateToken(payload, '1h');
console.log('Generated Token:', token);

const extracted = extractToken(`Bearer ${token}`);
console.log('Extracted Token:', extracted);

const decoded = verifyToken(token);
console.log('Decoded Payload:', decoded);
