#!/usr/bin/env node

/**
 * Upload Categories with Images via Admin API
 * Reads upload results and creates categories through the admin panel API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_URL = process.argv.includes('--local') 
  ? 'http://localhost:5000/api'
  : 'https://api.carmellawholesale.uk/api';

const RESULTS_FILE = 'upload-results-2026-04-29.json';

/**
 * Get auth token
 */
async function login(email, password) {
  try {
    console.log(`🔐 Logging in as ${email}...`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    const token = data.session?.access_token || data.access_token || data.token;
    
    console.log('✅ Login successful\n');
    return token;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    process.exit(1);
  }
}

/**
 * Get all categories
 */
async function getCategories(token) {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message);
    return [];
  }
}

/**
 * Update category with image
 */
async function updateCategory(categoryId, name, imageUrl, token) {
  try {
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        imageUrl: imageUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    console.log(`  ✅ ${name} (Updated with image)`);
    return data;
  } catch (error) {
    console.error(`  ❌ ${name}: ${error.message}`);
    return null;
  }
}

/**
 * Main
 */
async function main() {
  console.log('\n📦 Upload Categories via Admin API\n');
  console.log(`API: ${API_URL}\n`);

  // Get args
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--')) {
      const key = process.argv[i].substring(2);
      args[key] = process.argv[i + 1];
      i++;
    }
  }

  // Login
  let token = args.token;
  if (!token) {
    if (!args.email || !args.password) {
      console.error('❌ Missing credentials');
      console.error('\nUsage:');
      console.error('  node upload-categories.js --token <token>');
      console.error('  node upload-categories.js --email <email> --password <password>');
      process.exit(1);
    }
    token = await login(args.email, args.password);
  }

  // Read results
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`❌ ${RESULTS_FILE} not found`);
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
  console.log(`📸 Updating ${results.length} categories with images:\n`);

  // Get existing categories
  console.log('Fetching existing categories...\n');
  const existingCategories = await getCategories(token);
  console.log(`Found ${existingCategories.length} categories in database\n`);

  let successCount = 0;
  const updatedCategories = [];

  for (const result of results) {
    const categoryName = result.filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
    
    // Find matching category
    const existing = existingCategories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existing) {
      const updated = await updateCategory(existing.id, categoryName, result.publicUrl, token);
      
      if (updated) {
        successCount++;
        updatedCategories.push({
          name: categoryName,
          id: existing.id,
          imageUrl: result.publicUrl,
        });
      }
    } else {
      console.log(`  ⚠️  ${categoryName} not found in database`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Successfully updated: ${successCount}/${results.length}`);
  console.log(`${'='.repeat(50)}\n`);

  if (updatedCategories.length > 0) {
    fs.writeFileSync('categories-updated.json', JSON.stringify(updatedCategories, null, 2));
    console.log('✨ Done! Your categories now have images!\n');
  }

  process.exit(successCount === results.length ? 0 : 1);
}

main();
