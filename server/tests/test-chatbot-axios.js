const http = require('http');

async function testChatbot() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing chatbot API...');
    
    const data = JSON.stringify({
      message: 'Hello, can you help me with a civic issue?'
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
      timeout: 15000
    };

    const req = http.request(options, (res) => {
      console.log('✅ Response Status:', res.statusCode);
      console.log('📦 Response Headers:', res.headers);
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Raw Response Data:', responseData);
        
        try {
          const parsed = JSON.parse(responseData);
          console.log('📄 Parsed Response:', JSON.stringify(parsed, null, 2));
          
          if (parsed && parsed.data && parsed.data.response) {
            console.log('\n🤖 AI Response:');
            console.log(parsed.data.response);
          }
          
          resolve(parsed);
        } catch (e) {
          console.log('❌ Could not parse response as JSON:', e.message);
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
