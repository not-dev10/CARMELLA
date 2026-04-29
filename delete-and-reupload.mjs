#!/usr/bin/env node

/**
 * Delete All Categories and Re-upload Fresh
 * 
 * This script:
 * 1. Deletes all existing categories
 * 2. Uploads new categories with S3 image URLs
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
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message);
    return [];
  }
}

/**
 * Delete category
 */
async function deleteCategory(id, name, token) {
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Delete failed: ${response.status}`);
    }

    console.log(`  ✅ Deleted: ${name}`);
    return true;
  } catch (error) {
    console.log(`  ⚠️  ${name}: ${error.message}`);
    return false;
  }
}

/**
 * Create new category
 */
async function createCategory(name, imageUrl, token) {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        description: '',
        imageUrl: imageUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    console.log(`  ✅ Created: ${name}`);
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
  console.log('\n🔄 Delete & Re-upload Categories\n');
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
      console.error('  node delete-and-reupload.mjs --email <email> --password <password>');
      process.exit(1);
    }
    token = await login(args.email, args.password);
  }

  // Step 1: Get and delete existing categories
  console.log('📋 Fetching existing categories...\n');
  const existing = await getCategories(token);
  
  if (existing.length === 0) {
    console.log('✅ No existing categories found\n');
  } else {
    console.log(`🗑️  Deleting ${existing.length} existing categories:\n`);
    
    for (const cat of existing) {
      await deleteCategory(cat.id, cat.name, token);
      await new Promise(r => setTimeout(r, 200));
    }
    console.log('');
  }

  // Step 2: Read upload results
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`❌ ${RESULTS_FILE} not found`);
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
  console.log(`📸 Creating ${results.length} new categories:\n`);

  let successCount = 0;
  const createdCategories = [];

  for (const result of results) {
    const categoryName = result.filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
    const created = await createCategory(categoryName, result.publicUrl, token);
    
    if (created) {
      successCount++;
      createdCategories.push({
        name: categoryName,
        id: created.id || created[0]?.id,
        imageUrl: result.publicUrl,
      });
    }

    await new Promise(r => setTimeout(r, 200));
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Successfully created: ${successCount}/${results.length}`);
  console.log(`${'='.repeat(50)}\n`);

  if (createdCategories.length > 0) {
    fs.writeFileSync('categories-fresh.json', JSON.stringify(createdCategories, null, 2));
    console.log('✨ All categories re-uploaded and ready!\n');
  }

  process.exit(successCount === results.length ? 0 : 1);
}

main();
