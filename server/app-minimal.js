// Minimal app.js to test step by step
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));

// Basic middleware
app.use(express.json());

console.log('1. Basic middleware loaded');

// Test routes
try {
  const apiRoutes = require('./src/routes');
  console.log('2. Routes loaded successfully');
  
  app.use('/api', apiRoutes);
  console.log('3. Routes mounted successfully');
} catch (error) {
  console.error('Routes error:', error);
  process.exit(1);
}

// Basic endpoints
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Health check OK' });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server running' });
});

console.log('4. Basic endpoints added');

module.exports = app;
