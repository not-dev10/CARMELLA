#!/usr/bin/env node

/**
 * Test Cloudinary Upload
 * 
 * This script tests if Cloudinary is properly configured by attempting
 * to upload a test image using the unsigned upload preset.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CLOUD_NAME = 'dwis8ote1';
const UPLOAD_PRESET = 'carmella_products';

console.log('\n🧪 Testing Cloudinary Upload Configuration\n');
console.log('Cloud Name:', CLOUD_NAME);
console.log('Upload Preset:', UPLOAD_PRESET);
console.log('');

// Create a simple test image (1x1 red pixel PNG)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

function testUpload() {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"',
      'Content-Type: image/png',
      '',
      `data:image/png;base64,${testImageBase64}`,
      `--${boundary}`,
      'Content-Disposition: form-data; name="upload_preset"',
      '',
      UPLOAD_PRESET,
      `--${boundary}--`,
      ''
    ].join('\r\n');
    
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      }
    };
    
    console.log('📤 Uploading test image...');
    console.log('URL:', `https://${options.hostname}${options.path}`);
    console.log('');
    
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('');
        
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(body);
            console.log('✅ Upload Successful!\n');
            console.log('Image URL:', result.secure_url);
            console.log('Public ID:', result.public_id);
            console.log('Format:', result.format);
            console.log('Size:', result.bytes, 'bytes');
            console.log('');
            console.log('🎉 Cloudinary is properly configured!');
            console.log('');
            console.log('Next steps:');
            console.log('1. Go to http://localhost:5173/admin');
            console.log('2. Navigate to Products or Categories');
            console.log('3. Try uploading an image');
            console.log('');
            resolve(result);
          } catch (error) {
            console.error('❌ Error parsing response:', error.message);
            console.log('Response body:', body);
            reject(error);
          }
        } else {
          console.error('❌ Upload Failed!\n');
          console.log('Response body:', body);
          console.log('');
          
          try {
            const error = JSON.parse(body);
            console.log('Error details:', error);
            
            if (error.error && error.error.message) {
              console.log('');
              console.log('💡 Troubleshooting:');
              
              if (error.error.message.includes('preset')) {
                console.log('- Upload preset "' + UPLOAD_PRESET + '" not found or not unsigned');
                console.log('- Create it at: https://cloudinary.com/console/settings/upload');
                console.log('- Make sure "Signing Mode" is set to "Unsigned"');
              } else if (error.error.message.includes('Invalid')) {
                console.log('- Check your Cloud Name: ' + CLOUD_NAME);
                console.log('- Verify at: https://cloudinary.com/console');
              }
            }
          } catch (e) {
            // Response is not JSON
          }
          
          reject(new Error(`Upload failed with status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });
    
    req.write(formData);
    req.end();
  });
}

// Run the test
testUpload().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
