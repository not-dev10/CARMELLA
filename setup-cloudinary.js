#!/usr/bin/env node

/**
 * Cloudinary Setup Script
 * 
 * This script helps you configure Cloudinary for the Carmella project.
 * It will:
 * 1. Prompt for your Cloudinary credentials
 * 2. Create an unsigned upload preset
 * 3. Update your .env files automatically
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🌥️  Cloudinary Setup for Carmella\n');
  console.log('This script will help you configure Cloudinary image uploads.\n');
  
  // Step 1: Get credentials
  console.log('📋 Step 1: Enter your Cloudinary credentials');
  console.log('   (Get these from: https://cloudinary.com/console)\n');
  
  const cloudName = await question('Cloud Name: ');
  const apiKey = await question('API Key: ');
  const apiSecret = await question('API Secret: ');
  
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('\n❌ Error: All credentials are required!');
    rl.close();
    process.exit(1);
  }
  
  // Step 2: Create upload preset
  console.log('\n📤 Step 2: Creating unsigned upload preset...');
  
  const presetName = 'carmella_products';
  
  try {
    const preset = await createUploadPreset(cloudName, apiKey, apiSecret, presetName);
    console.log(`✅ Upload preset created: ${presetName}`);
  } catch (error) {
    console.error(`⚠️  Could not create preset automatically: ${error.message}`);
    console.log('\n📝 Please create the preset manually:');
    console.log('   1. Go to: https://cloudinary.com/console/settings/upload');
    console.log('   2. Click "Add upload preset"');
    console.log(`   3. Name: ${presetName}`);
    console.log('   4. Signing Mode: Unsigned');
    console.log('   5. Folder: carmella/products (optional)');
    console.log('   6. Save\n');
  }
  
  // Step 3: Update .env files
  console.log('\n📝 Step 3: Updating environment files...');
  
  // Update backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  updateEnvFile(backendEnvPath, {
    'CLOUDINARY_CLOUD_NAME': cloudName,
    'CLOUDINARY_API_KEY': apiKey,
    'CLOUDINARY_API_SECRET': apiSecret
  });
  console.log('✅ Updated backend/.env');
  
  // Update frontend .env
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  updateEnvFile(frontendEnvPath, {
    'VITE_CLOUDINARY_CLOUD_NAME': cloudName,
    'VITE_CLOUDINARY_UPLOAD_PRESET': presetName
  });
  console.log('✅ Updated frontend/.env');
  
  // Update frontend .env.local
  const frontendEnvLocalPath = path.join(__dirname, 'frontend', '.env.local');
  updateEnvFile(frontendEnvLocalPath, {
    'VITE_CLOUDINARY_CLOUD_NAME': cloudName,
    'VITE_CLOUDINARY_UPLOAD_PRESET': presetName
  });
  console.log('✅ Updated frontend/.env.local');
  
  console.log('\n✨ Setup complete!\n');
  console.log('📌 Next steps:');
  console.log('   1. Restart your backend server: cd backend && npm run dev');
  console.log('   2. Restart your frontend server: cd frontend && npm run dev');
  console.log('   3. Test image upload in Admin Panel → Products\n');
  
  rl.close();
}

function updateEnvFile(filePath, updates) {
  let content = '';
  
  // Read existing file if it exists
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  }
  
  // Update or add each variable
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;
    
    if (regex.test(content)) {
      // Update existing
      content = content.replace(regex, newLine);
    } else {
      // Add new (in Cloudinary section if it exists)
      const cloudinarySection = content.indexOf('# Cloudinary');
      if (cloudinarySection !== -1) {
        // Find end of Cloudinary section
        const nextSection = content.indexOf('\n#', cloudinarySection + 1);
        const insertPos = nextSection !== -1 ? nextSection : content.length;
        content = content.slice(0, insertPos) + `${newLine}\n` + content.slice(insertPos);
      } else {
        // Add at end
        content += `\n${newLine}`;
      }
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function createUploadPreset(cloudName, apiKey, apiSecret, presetName) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    const data = JSON.stringify({
      name: presetName,
      unsigned: true,
      folder: 'carmella/products',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      tags: ['carmella', 'product']
    });
    
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${cloudName}/upload_presets`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Run the script
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
