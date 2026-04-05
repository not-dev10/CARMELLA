import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = `test-${Date.now()}@example.com`; // Use unique email to avoid rate limiting
const TEST_PASSWORD = 'test123456';

/**
 * Test S3 upload flow
 */
async function testS3Upload() {
  try {
    console.log('🚀 Starting S3 Upload Test...\n');

    // Step 1: Register/Login user
    console.log('📝 Step 1: Authenticating user...');
    let loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    let loginText = await loginRes.text();
    let loginData;
    try {
      loginData = JSON.parse(loginText);
    } catch (e) {
      throw new Error(`Invalid JSON from login (${loginRes.status}): ${loginText}`);
    }

    // If login fails, try registering
    if (!loginRes.ok) {
      console.log('   → User not found, registering...');
      const registerRes = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          name: 'Test User',
        }),
      });

      const registerText = await registerRes.text();
      try {
        loginData = JSON.parse(registerText);
      } catch (e) {
        throw new Error(`Invalid JSON response from signup (${registerRes.status}): ${registerText}`);
      }
      if (!registerRes.ok) {
        throw new Error(`Registration failed (${registerRes.status}): ${JSON.stringify(loginData)}`);
      }
    }

    const token = loginData.token;
    if (!token) {
      throw new Error(`No authentication token received: ${JSON.stringify(loginData)}`);
    }
    console.log('   ✅ Authenticated successfully\n');

    // Step 2: Get signed URL
    console.log('🔓 Step 2: Getting signed upload URL from S3...');
    const signedUrlRes = await fetch(`${API_URL}/upload/get-signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename: 'test-product.jpg',
        fileType: 'product',
      }),
    });

    const signedUrlData = await signedUrlRes.json();
    if (!signedUrlRes.ok) {
      throw new Error(`Failed to get signed URL: ${JSON.stringify(signedUrlData)}`);
    }

    const { signedUrl, publicUrl } = signedUrlData;
    console.log('   ✅ Got signed URL\n');
    console.log(`   📍 Public URL: ${publicUrl}\n`);

    // Step 3: Create a sample image (1x1 pixel as test)
    console.log('🖼️  Step 3: Creating sample test image...');
    
    // Create a simple 1x1 JPEG image (minimal valid JPEG)
    const jpegData = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
      0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
      0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
      0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
      0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
      0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
      0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
      0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
      0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
      0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
      0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
      0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
      0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
      0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
      0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
      0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD6, 0xFF, 0xD9,
    ]);

    const testImagePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(testImagePath, jpegData);
    console.log(`   ✅ Sample image created: ${testImagePath}\n`);

    // Step 4: Upload to S3
    console.log('📤 Step 4: Uploading image to S3...');
    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: jpegData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`Upload failed (${uploadRes.status}): ${errorText}`);
    }

    console.log('   ✅ Image uploaded successfully!\n');

    // Cleanup
    fs.unlinkSync(testImagePath);

    // Summary
    console.log('✨ Upload Test Complete!\n');
    console.log('Summary:');
    console.log(`  📍 Public URL: ${publicUrl}`);
    console.log(`  🪣 Bucket: ${publicUrl.split('.s3.')[0].split('//')[1]}`);
    console.log(`  🌍 Region: eu-north-1`);
    console.log(`  ✅ Status: SUCCESS\n`);

    // Verify URL is accessible
    console.log('🔍 Verifying image is accessible...');
    try {
      const verifyRes = await fetch(publicUrl, { method: 'HEAD' });
      if (verifyRes.ok) {
        console.log('   ✅ Image is publicly accessible!\n');
      } else {
        console.log(`   ⚠️  Image returned status ${verifyRes.status}\n`);
      }
    } catch (err) {
      console.log(`   ⚠️  Could not verify (might be S3 consistency delay): ${err.message}\n`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Ensure backend is running: npm run dev');
    console.error('  2. Check S3 credentials in .env');
    console.error('  3. Verify bucket is in eu-north-1 region');
    process.exit(1);
  }
}

// Run test
testS3Upload();
