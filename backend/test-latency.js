#!/usr/bin/env node

/**
 * API Latency Testing Script
 * Tests all endpoints and reports latency metrics
 * 
 * Usage: node test-latency.js
 */

import http from 'http';
import { URL } from 'url';

const API_BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}@test.com`,
  password: 'Test123!@#',
};

// Test endpoints
const ENDPOINTS = [
  // Public endpoints (no auth required)
  { method: 'GET', path: '/categories', name: 'Get Categories', auth: false },
  { method: 'GET', path: '/products', name: 'Get Products', auth: false },
  { method: 'GET', path: '/products?limit=20', name: 'Get Products (Limited)', auth: false },
  { method: 'GET', path: '/homepage/content', name: 'Get Homepage Content', auth: false },
  
  // Protected endpoints (require auth token)
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

let authToken = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Test results storage
const results = [];

/**
 * Create test user and get auth token
 */
async function getAuthToken() {
  console.log(`${colors.gray}Setting up test user...${colors.reset}`);
  
  try {
    // Try to signup
    const signupResult = await makeRequest('POST', '/auth/signup', {}, null, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (signupResult.status === 201 || signupResult.status === 200) {
      console.log(`${colors.green}✓ Test user created${colors.reset}`);
    }

    // Login to get token
    const loginResult = await makeRequest('POST', '/auth/login', {}, null, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (loginResult.status === 200 && loginResult.data && loginResult.data.token) {
      authToken = loginResult.data.token;
      console.log(`${colors.green}✓ Auth token obtained${colors.reset}\n`);
      return authToken;
    } else {
      console.log(`${colors.yellow}⚠ Could not get auth token, testing without auth${colors.reset}\n`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Auth setup failed: ${error.message}${colors.reset}\n`);
    return null;
  }
}
function makeRequest(method, path, headers = {}, authToken = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 10000,
    };

    // Add auth token if provided
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const latency = Date.now() - startTime;
        resolve({
          status: res.statusCode,
          latency,
          headers: res.headers,
        });
      });
    });

    req.on('error', (error) => {
      const latency = Date.now() - startTime;
      reject({
        error: error.message,
        latency,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const latency = Date.now() - startTime;
      reject({
        error: 'Request timeout',
        latency,
      });
    });

    req.end();
  });
}

/**
 * Get latency color based on value
 */
function getLatencyColor(latency) {
  if (latency < 100) return colors.green;
  if (latency < 300) return colors.cyan;
  if (latency < 500) return colors.yellow;
  return colors.red;
}

/**
 * Format latency with color
 */
function formatLatency(latency) {
  const color = getLatencyColor(latency);
  return `${color}${latency}ms${colors.reset}`;
}

/**
 * Test single endpoint
 */
async function testEndpoint(endpoint, index, total) {
  const progress = `[${index}/${total}]`;
  process.stdout.write(`${progress} Testing ${endpoint.name}... `);

  try {
    // Use auth token for protected endpoints
    const token = endpoint.auth ? authToken : null;
    const result = await makeRequest(endpoint.method, endpoint.path, {}, token);
    const latency = result.latency;
    const status = result.status;

    const statusColor = status === 200 ? colors.green : status >= 400 ? colors.red : colors.yellow;
    const statusStr = `${statusColor}${status}${colors.reset}`;

    console.log(`${statusStr} ${formatLatency(latency)}`);

    results.push({
      name: endpoint.name,
      method: endpoint.method,
      path: endpoint.path,
      status,
      latency,
      success: status === 200,
    });
  } catch (error) {
    console.log(`${colors.red}ERROR${colors.reset} ${error.error || error.message}`);
    results.push({
      name: endpoint.name,
      method: endpoint.method,
      path: endpoint.path,
      status: 0,
      latency: error.latency || 0,
      success: false,
      error: error.error || error.message,
    });
  }
}

/**
 * Print summary report
 */
function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bright}LATENCY TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(80) + '\n');

  // Calculate statistics
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const latencies = successful.map(r => r.latency);

  if (latencies.length === 0) {
    console.log(`${colors.red}No successful requests${colors.reset}`);
    return;
  }

  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

  console.log(`${colors.bright}Overall Statistics:${colors.reset}`);
  console.log(`  Total Requests:    ${results.length}`);
  console.log(`  Successful:        ${colors.green}${successful.length}${colors.reset}`);
  console.log(`  Failed:            ${failed.length > 0 ? colors.red : colors.green}${failed.length}${colors.reset}`);
  console.log(`  Success Rate:      ${colors.green}${((successful.length / results.length) * 100).toFixed(1)}%${colors.reset}`);

  console.log(`\n${colors.bright}Latency Statistics:${colors.reset}`);
  console.log(`  Average:           ${formatLatency(avgLatency)}`);
  console.log(`  Min:               ${formatLatency(minLatency)}`);
  console.log(`  Max:               ${formatLatency(maxLatency)}`);
  console.log(`  P95:               ${formatLatency(p95Latency)}`);

  // Performance rating
  console.log(`\n${colors.bright}Performance Rating:${colors.reset}`);
  if (avgLatency < 150) {
    console.log(`  ${colors.green}✓ EXCELLENT${colors.reset} - Average latency < 150ms`);
  } else if (avgLatency < 300) {
    console.log(`  ${colors.cyan}✓ GOOD${colors.reset} - Average latency < 300ms`);
  } else if (avgLatency < 500) {
    console.log(`  ${colors.yellow}⚠ ACCEPTABLE${colors.reset} - Average latency < 500ms`);
  } else {
    console.log(`  ${colors.red}✗ SLOW${colors.reset} - Average latency > 500ms`);
  }

  // Slowest endpoints
  console.log(`\n${colors.bright}Slowest Endpoints:${colors.reset}`);
  const slowest = successful.sort((a, b) => b.latency - a.latency).slice(0, 5);
  slowest.forEach((endpoint, idx) => {
    console.log(`  ${idx + 1}. ${endpoint.name} - ${formatLatency(endpoint.latency)}`);
  });

  // Fastest endpoints
  console.log(`\n${colors.bright}Fastest Endpoints:${colors.reset}`);
  const fastest = successful.sort((a, b) => a.latency - b.latency).slice(0, 5);
  fastest.forEach((endpoint, idx) => {
    console.log(`  ${idx + 1}. ${endpoint.name} - ${formatLatency(endpoint.latency)}`);
  });

  // Failed endpoints
  if (failed.length > 0) {
    console.log(`\n${colors.bright}Failed Endpoints:${colors.reset}`);
    failed.forEach((endpoint, idx) => {
      console.log(`  ${idx + 1}. ${endpoint.name} - ${colors.red}${endpoint.error}${colors.reset}`);
    });
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Print detailed results table
 */
function printDetailedResults() {
  console.log(`${colors.bright}DETAILED RESULTS:${colors.reset}\n`);

  // Table header
  const headers = ['#', 'Endpoint', 'Method', 'Status', 'Latency'];
  const colWidths = [3, 40, 6, 8, 10];

  console.log(
    headers
      .map((h, i) => h.padEnd(colWidths[i]))
      .join('│')
  );
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

  console.log();
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║   API LATENCY TEST SUITE               ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.gray}Testing ${ENDPOINTS.length} endpoints...${colors.reset}\n`);

  // Note about auth
  console.log(`${colors.yellow}Note: Protected endpoints (auth required) will return 401${colors.reset}`);
  console.log(`${colors.yellow}This is expected - they require valid auth tokens${colors.reset}\n`);

  // Test each endpoint
  for (let i = 0; i < ENDPOINTS.length; i++) {
    await testEndpoint(ENDPOINTS[i], i + 1, ENDPOINTS.length);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Print results
  printDetailedResults();
  printSummary();

  // Exit with appropriate code
  const failed = results.filter(r => !r.success);
  process.exit(failed.length > 0 ? 1 : 0);
}

// Run tests
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
