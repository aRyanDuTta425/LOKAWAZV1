// Test server to isolate the issue
const express = require('express');
const app = express();

app.use(express.json());

// Test basic endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Test routes import
try {
  console.log('Loading routes...');
  const apiRoutes = require('../src/routes');
  console.log('Routes loaded successfully');
  
  app.use('/api', apiRoutes);
  console.log('Routes mounted successfully');
} catch (error) {
  console.error('Error loading routes:', error);
  process.exit(1);
}

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
