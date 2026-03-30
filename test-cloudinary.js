// Test Cloudinary Upload with environment values
const CLOUD_NAME = "dwis8ote1";
const UPLOAD_PRESET = "ml_default";

console.log("🔍 Cloudinary Test Configuration:");
console.log(`Cloud Name: ${CLOUD_NAME}`);
console.log(`Upload Preset: ${UPLOAD_PRESET}`);
console.log("");

// Create a simple test image (1x1 pixel PNG)
const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const buffer = Buffer.from(testImageBase64, "base64");

console.log("📤 Uploading test image to Cloudinary...");
console.log(`Upload URL: https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
console.log("");

const formData = new FormData();
formData.append("file", new Blob([buffer]), "test.png");
formData.append("upload_preset", UPLOAD_PRESET);

fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
  method: "POST",
  body: formData,
})
  .then(res => {
    console.log(`✓ Response Status: ${res.status} ${res.statusText}`);
    return res.json();
  })
  .then(data => {
    if (data.secure_url) {
      console.log("✅ Upload SUCCESSFUL!");
      console.log(`Image URL: ${data.secure_url}`);
    } else if (data.error) {
      console.error("❌ Upload FAILED!");
      console.error(`Error: ${data.error.message}`);
    } else {
      console.log("Response:", data);
    }
  })
  .catch(err => {
    console.error("❌ Network Error:", err.message);
  });
