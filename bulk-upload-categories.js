#!/usr/bin/env node

/**
 * Bulk Category Image Upload Script
 * 
 * Uploads all images from Downloads/CATEGORIES folder to S3 via your API
 * 
 * Usage:
 *   node bulk-upload-categories.js --token <jwt_token>
 *   OR
 *   node bulk-upload-categories.js --email <email> --password <password>
 * 
 * Examples:
 *   node bulk-upload-categories.js --token "eyJhbGciOiJIUzI1NiI..."
 *   node bulk-upload-categories.js --email admin@example.com --password mypassword
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const DOWNLOADS_FOLDER = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'CATEGORIES');
const API_BASE_URL = 'https://api.carmellawholesale.uk/api';
// Fallback for local testing
const API_URL = process.argv.includes('--local') 
  ? 'http://localhost:5000/api'
  : API_BASE_URL;

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      result[key] = args[i + 1];
      i++;
    }
  }

  return result;
}

/**
 * Login and get JWT token
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
      const error = await response.json();
      throw new Error(error.message || `Login failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Login successful');
    return data.token || data.access_token;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    process.exit(1);
  }
}

/**
 * Get presigned URL from backend
 */
async function getPresignedUrl(filename, token) {
  try {
    const response = await fetch(`${API_URL}/upload/get-signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename: filename,
        fileType: 'category',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to get signed URL: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Error getting signed URL for ${filename}:`, error.message);
    return null;
  }
}

/**
 * Upload file to S3 using presigned URL
 */
async function uploadToS3(filePath, signedUrl) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = getContentType(filePath);

    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error uploading to S3:`, error.message);
    return false;
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Get all image files from CATEGORIES folder
 */
function getImageFiles() {
  if (!fs.existsSync(DOWNLOADS_FOLDER)) {
    console.error(`❌ Categories folder not found: ${DOWNLOADS_FOLDER}`);
    console.error('Please create the folder and add your category images.');
    process.exit(1);
  }

  const files = fs.readdirSync(DOWNLOADS_FOLDER);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  });

  return imageFiles;
}

/**
 * Main upload process
 */
async function main() {
  console.log('\n📦 Carmella Bulk Category Upload\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`Source: ${DOWNLOADS_FOLDER}\n`);

  // Parse arguments
  const args = parseArgs();
  let token = args.token;

  // If no token, try to login
  if (!token) {
    if (args.email && args.password) {
      token = await login(args.email, args.password);
    } else {
      console.error('❌ Error: No authentication provided');
      console.error('\nUsage:');
      console.error('  node bulk-upload-categories.js --token <jwt_token>');
      console.error('  node bulk-upload-categories.js --email <email> --password <password>');
      console.error('\nExample:');
      console.error('  node bulk-upload-categories.js --token "eyJhbGciOiJIUzI1NiI..."');
      process.exit(1);
    }
  }

  // Get image files
  const imageFiles = getImageFiles();

  if (imageFiles.length === 0) {
    console.error(`❌ No image files found in ${DOWNLOADS_FOLDER}`);
    console.error(`\nSupported formats: ${SUPPORTED_FORMATS.join(', ')}`);
    process.exit(1);
  }

  console.log(`📸 Found ${imageFiles.length} image(s) to upload:\n`);
  imageFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log('');

  // Upload each file
  let successCount = 0;
  let failureCount = 0;
  const uploadedUrls = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const filePath = path.join(DOWNLOADS_FOLDER, filename);
    const fileSize = fs.statSync(filePath).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

    console.log(`\n[${i + 1}/${imageFiles.length}] Uploading: ${filename} (${fileSizeMB}MB)`);

    // Get presigned URL
    console.log('  → Getting presigned URL...');
    const urlData = await getPresignedUrl(filename, token);

    if (!urlData || !urlData.signedUrl) {
      console.error(`  ❌ Failed to get presigned URL`);
      failureCount++;
      continue;
    }

    // Upload to S3
    console.log('  → Uploading to S3...');
    const uploadSuccess = await uploadToS3(filePath, urlData.signedUrl);

    if (uploadSuccess) {
      console.log(`  ✅ Upload successful`);
      console.log(`  📍 Public URL: ${urlData.publicUrl}`);
      uploadedUrls.push({
        filename: filename,
        publicUrl: urlData.publicUrl,
        s3Key: urlData.key,
      });
      successCount++;
    } else {
      console.error(`  ❌ Upload failed`);
      failureCount++;
    }

    // Add small delay between uploads to avoid rate limiting
    if (i < imageFiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📦 Total: ${imageFiles.length}`);
  console.log('='.repeat(60) + '\n');

  // Save results to JSON file
  if (uploadedUrls.length > 0) {
    const resultsFile = path.join(process.cwd(), `upload-results-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(uploadedUrls, null, 2));
    console.log(`💾 Results saved to: ${resultsFile}\n`);
  }

  // Exit with appropriate code
  process.exit(failureCount > 0 ? 1 : 0);
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
