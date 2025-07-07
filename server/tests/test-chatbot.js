const http = require('http');

const data = JSON.stringify({
  message: 'Hello, test message'
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/chatbot/message',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 10000 // 10 second timeout
};

console.log('Testing chatbot API...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received:');
    console.log(responseData);
    try {
      const parsed = JSON.parse(responseData);
      console.log('Parsed response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
});

req.write(data);
req.end();
