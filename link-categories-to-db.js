#!/usr/bin/env node

/**
 * Link Category Images to Database
 * 
 * Takes the upload results JSON and creates/updates categories with S3 image URLs
 * This makes the images visible in the admin panel and on the website
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE_URL = 'https://api.carmellawholesale.uk/api';
const API_URL = process.argv.includes('--local') ? 'http://localhost:5000/api' : API_BASE_URL;

// Configuration
const RESULTS_FILE = 'upload-results-2026-04-29.json';

/**
 * Get token from login
 */
async function getAuthToken(email, password) {
  try {
    console.log(`🔐 Authenticating as ${email}...`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Login failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Authentication successful');
    
    // Handle Supabase response structure
    if (data.session?.access_token) {
      return data.session.access_token;
    } else if (data.access_token) {
      return data.access_token;
    } else if (data.token) {
      return data.token;
    }
    
    throw new Error('No token found in response');
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    process.exit(1);
  }
}

/**
 * Create or update category with image
 */
async function createOrUpdateCategory(name, imageUrl, token) {
  try {
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    console.log(`  → Creating/updating: ${name} (slug: ${slug})`);

    // Try to create first
    const createResponse = await fetch(`${API_URL}/categories`, {
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

    if (createResponse.ok) {
      const data = await createResponse.json();
      console.log(`    ✅ Created: ${data.id}`);
      return { created: true, id: data.id };
    }

    // If it fails (probably exists), try to update
    if (createResponse.status === 400 || createResponse.status === 409) {
      console.log(`    → Category exists, searching for it...`);
      
      // Get all categories and find the matching one
      const allResponse = await fetch(`${API_URL}/categories`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!allResponse.ok) {
        throw new Error('Failed to fetch categories');
      }

      const allData = await allResponse.json();
      const existing = allData.categories?.find(c => 
        c.name.toLowerCase() === name.toLowerCase()
      );

      if (existing) {
        // Update the category
        const updateResponse = await fetch(`${API_URL}/categories/${existing.id}`, {
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

        if (updateResponse.ok) {
          const data = await updateResponse.json();
          console.log(`    ✅ Updated: ${data.id}`);
          return { created: false, id: data.id };
        } else {
          const error = await updateResponse.json();
          throw new Error(error.error || `Update failed: ${updateResponse.status}`);
        }
      } else {
        throw new Error('Category not found and create failed');
      }
    } else {
      const error = await createResponse.json();
      throw new Error(error.error || `Request failed: ${createResponse.status}`);
    }
  } catch (error) {
    console.error(`    ❌ Error: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Main process
 */
async function main() {
  console.log('\n📦 Link Category Images to Database\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`Results File: ${RESULTS_FILE}\n`);

  // Get auth credentials from args
  const args = {};
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--')) {
      const key = process.argv[i].substring(2);
      args[key] = process.argv[i + 1];
      i++;
    }
  }

  let token = args.token;
  if (!token) {
    if (args.email && args.password) {
      token = await getAuthToken(args.email, args.password);
    } else {
      console.error('❌ Error: No authentication provided');
      console.error('\nUsage:');
      console.error('  node link-categories-to-db.js --token <jwt_token>');
      console.error('  node link-categories-to-db.js --email <email> --password <password>');
      process.exit(1);
    }
  }

  // Read upload results
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`❌ Error: ${RESULTS_FILE} not found`);
    console.error(`Make sure you've run the upload script first`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(RESULTS_FILE, 'utf-8');
  const results = JSON.parse(rawData);

  console.log(`📸 Found ${results.length} uploaded categories\n`);
  console.log('Processing...\n');

  // Process each uploaded image
  let successCount = 0;
  let errorCount = 0;
  const processedCategories = [];

  for (let i = 0; i < results.length; i++) {
    const { filename, publicUrl } = results[i];
    
    // Extract category name from filename (remove .png/.jpg)
    const categoryName = filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');

    console.log(`[${i + 1}/${results.length}] ${categoryName}`);

    const result = await createOrUpdateCategory(categoryName, publicUrl, token);

    if (result.error) {
      errorCount++;
    } else {
      successCount++;
      processedCategories.push({
        name: categoryName,
        imageUrl: publicUrl,
        id: result.id,
        created: result.created,
      });
    }

    // Small delay between requests
    if (i < results.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📦 Total: ${results.length}`);
  console.log('='.repeat(60) + '\n');

  // Save processed categories
  if (processedCategories.length > 0) {
    const outputFile = 'categories-linked.json';
    fs.writeFileSync(outputFile, JSON.stringify(processedCategories, null, 2));
    console.log(`✅ Categories linked to database!\n`);
    console.log(`📝 Details saved to: ${outputFile}\n`);
    console.log('🎉 Your categories are now visible in:');
    console.log('   - Admin panel → Categories section');
    console.log('   - Website homepage → Categories showcase\n');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
