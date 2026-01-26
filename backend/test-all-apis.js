#!/usr/bin/env node

import http from 'http';
import { URL } from 'url';

const API_BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'carmellaworld01@gmail.com',
  password: 'carmella@2026',
};

// Test endpoints
const ENDPOINTS = [
  // Public endpoints
  { method: 'GET', path: '/categories', name: 'Get Categories', auth: false },
  { method: 'GET', path: '/products', name: 'Get Products', auth: false },
  { method: 'GET', path: '/products?limit=20', name: 'Get Products (Limited)', auth: false },
  { method: 'GET', path: '/homepage/content', name: 'Get Homepage Content', auth: false },
  
  // Protected endpoints
  { method: 'GET', path: '/cart', name: 'Get Cart', auth: true },
  { method: 'GET', path: '/orders', name: 'Get Orders', auth: true },
  { method: 'GET', path: '/wishlist', name: 'Get Wishlist', auth: true },
  
  // Admin endpoints
  { method: 'GET', path: '/admin/users', name: 'Get Users (Admin)', auth: true },
  { method: 'GET', path: '/admin/orders', name: 'Get Orders (Admin)', auth: true },
  { method: 'GET', path: '/admin/inventory', name: 'Get Inventory (Admin)', auth: true },
  { method: 'GET', path: '/admin/inventory/stats', name: 'Get Inventory Stats (Admin)', auth: true },
  { method: 'GET', path: '/admin/b2b-requests', name: 'Get B2B Requests (Admin)', auth: true },
  { method: 'GET', path: '/admin/analytics/dashboard', name: 'Get Analytics Dashboard (Admin)', auth: true },
];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const results = [];
let authToken = null;

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const latency = Date.now() - startTime;
        try {
          resolve({
            status: res.statusCode,
            latency,
            data: JSON.parse(data),
          });
        } catch {
          resolve({ status: res.statusCode, latency, data: null });
        }
      });
    });

    req.on('error', (error) => {
      reject({ error: error.message, latency: Date.now() - startTime });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ error: 'Timeout', latency: Date.now() - startTime });
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function getLatencyColor(latency) {
  if (latency < 100) return colors.green;
  if (latency < 300) return colors.cyan;
  if (latency < 500) return colors.yellow;
  return colors.red;
}

function formatLatency(latency) {
  return `${getLatencyColor(latency)}${latency}ms${colors.reset}`;
}

async function setupAuth() {
  console.log(`${colors.gray}Setting up authentication...${colors.reset}`);
  
  try {
    // Login with admin credentials
    const loginRes = await makeRequest('POST', '/auth/login', TEST_USER);
    if (loginRes.status === 200 && loginRes.data?.session?.access_token) {
      authToken = loginRes.data.session.access_token;
      console.log(`${colors.green}✓ Admin authenticated${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠ Login failed: ${loginRes.data?.error}${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Auth setup failed: ${error.error}${colors.reset}\n`);
  }
  return false;
}

async function testEndpoint(endpoint, index, total) {
  const progress = `[${index}/${total}]`;
  process.stdout.write(`${progress} ${endpoint.name}... `);

  try {
    const token = endpoint.auth ? authToken : null;
    const result = await makeRequest(endpoint.method, endpoint.path, null, token);
    const statusColor = result.status === 200 ? colors.green : result.status >= 400 ? colors.red : colors.yellow;
    
    console.log(`${statusColor}${result.status}${colors.reset} ${formatLatency(result.latency)}`);
    
    results.push({
      name: endpoint.name,
      method: endpoint.method,
      path: endpoint.path,
      status: result.status,
      latency: result.latency,
      success: result.status === 200,
    });
  } catch (error) {
    console.log(`${colors.red}ERROR${colors.reset} ${error.error}`);
    results.push({
      name: endpoint.name,
      method: endpoint.method,
      path: endpoint.path,
      status: 0,
      latency: error.latency || 0,
      success: false,
      error: error.error,
    });
  }
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bright}LATENCY TEST RESULTS${colors.reset}`);
  console.log('='.repeat(80) + '\n');

  // Table
  const headers = ['#', 'Endpoint', 'Method', 'Status', 'Latency'];
  const colWidths = [3, 40, 6, 8, 10];
  
  console.log(headers.map((h, i) => h.padEnd(colWidths[i])).join('│'));
  console.log('─'.repeat(colWidths.reduce((a, b) => a + b, 0) + 4));

  results.forEach((result, idx) => {
    const statusColor = result.success ? colors.green : colors.red;
    const statusStr = result.success ? result.status : 'ERR';
    const latencyStr = result.success ? `${result.latency}ms` : '—';

    const row = [
      (idx + 1).toString().padEnd(colWidths[0]),
      result.name.substring(0, 40).padEnd(colWidths[1]),
      result.method.padEnd(colWidths[2]),
      `${statusColor}${statusStr}${colors.reset}`.padEnd(colWidths[3] + colors.reset.length),
      formatLatency(result.latency).padEnd(colWidths[4] + colors.reset.length),
    ];

    console.log(row.join('│'));
  });

  // Summary
  const successful = results.filter(r => r.success);
  const latencies = successful.map(r => r.latency);

  if (latencies.length > 0) {
    const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const p95 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

    console.log('\n' + '='.repeat(80));
    console.log(`${colors.bright}SUMMARY${colors.reset}`);
    console.log('='.repeat(80));
    console.log(`Total:       ${results.length}`);
    console.log(`Successful:  ${colors.green}${successful.length}${colors.reset}`);
    console.log(`Failed:      ${results.length - successful.length > 0 ? colors.red : colors.green}${results.length - successful.length}${colors.reset}`);
    console.log(`Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);
    console.log(`\nLatency Stats:`);
    console.log(`  Average: ${formatLatency(avg)}`);
    console.log(`  Min:     ${formatLatency(min)}`);
    console.log(`  Max:     ${formatLatency(max)}`);
    console.log(`  P95:     ${formatLatency(p95)}`);
    console.log('='.repeat(80) + '\n');
  }
}

async function main() {
  console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║   API LATENCY TEST - ALL ENDPOINTS     ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  // Setup auth
  await setupAuth();

  console.log(`${colors.gray}Testing ${ENDPOINTS.length} endpoints...${colors.reset}\n`);

  // Test endpoints
  for (let i = 0; i < ENDPOINTS.length; i++) {
    await testEndpoint(ENDPOINTS[i], i + 1, ENDPOINTS.length);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  printResults();
  process.exit(results.filter(r => !r.success).length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
