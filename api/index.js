// Vercel serverless function handler
const path = require('path');

// Set the correct path for the server files
process.env.NODE_PATH = path.join(__dirname, '..', 'server');

const app = require('../server/app');

module.exports = app;
