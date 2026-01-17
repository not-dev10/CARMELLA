#!/usr/bin/env node

const http = require('http');

// Test endpoints
const tests = [
  {
    name: 'GET /api/products',
    method: 'GET',
    path: '/api/products'
  },
  {
    name: 'GET /api/categories',
    method: 'GET',
    path: '/api/categories'
  }
];

let completed = 0;

tests.forEach(test => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: test.path,
    method: test.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log(`\n📝 Testing: ${test.name}`);
  console.log('━'.repeat(50));

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log('Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response:', data);
      }
      
      completed++;
      if (completed === tests.length) {
        console.log('\n✅ All tests completed!');
        process.exit(0);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
    completed++;
    if (completed === tests.length) {
      console.log('\n✅ All tests completed!');
      process.exit(0);
    }
  });

  req.end();
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('\n⏱️ Request timeout!');
  process.exit(1);
}, 5000);
