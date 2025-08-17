const http = require('http');

// Test if the authExchange endpoint returns 401 without a token
const testAuthExchange = () => {
  const options = {
    hostname: 'us-central1-climatefinance-2dcc3.cloudfunctions.net',
    path: '/authExchange',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // No Authorization header - should return 400 for missing token
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response:', data);
      if (res.statusCode === 400) {
        console.log('✅ Test passed: Missing token correctly returns 400');
      } else {
        console.log('❌ Unexpected status code');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(JSON.stringify({}));
  req.end();
};

// Test with an expired token
const testExpiredToken = () => {
  // This is an expired Firebase token (safe to use for testing)
  const expiredToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjAzYjJkMjJjMmZlY2Y4NzNlZDE5ZTViOGNmNzA0YWZiN2ViNzha';
  
  const options = {
    hostname: 'us-central1-climatefinance-2dcc3.cloudfunctions.net', 
    path: '/authExchange',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${expiredToken}`
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nExpired Token Test - Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response:', data);
      if (res.statusCode === 401) {
        console.log('✅ Test passed: Expired token correctly returns 401');
      } else {
        console.log('❌ Unexpected status code for expired token');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(JSON.stringify({}));
  req.end();
};

console.log('Testing authExchange endpoint...\n');
console.log('Test 1: Missing token');
testAuthExchange();

setTimeout(() => {
  console.log('\nTest 2: Expired token');
  testExpiredToken();
}, 2000);