const http = require('http');

async function testChatbot() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing corrected chatbot API...');
    
    const data = JSON.stringify({
      message: 'Test message'
    });

    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/chatbot/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      console.log('✅ Response Status:', res.statusCode);
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log('📄 Response Structure:');
          console.log('- success:', parsed.success);
          console.log('- message:', parsed.message);
          console.log('- data.response length:', parsed.data?.response?.length || 'N/A');
          console.log('- data.timestamp:', parsed.data?.timestamp || 'N/A');
          
          resolve(parsed);
        } catch (e) {
          console.error('❌ Could not parse response:', e.message);
          console.log('Raw response:', responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      reject(e);
    });

    req.on('timeout', () => {
      console.error('❌ Request timed out');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

testChatbot().catch(console.error);
