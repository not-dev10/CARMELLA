import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const s3Client = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "AKIAQIBIBH6ED4WJNIFX",
    secretAccessKey: "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",
  },
});

const images = [
  { local: "4.jpeg", s3: "collection/4-baby-care.jpeg" },
  { local: "1.jpeg", s3: "collection/1-spices.jpeg" },
  { local: "2.jpeg", s3: "collection/2-grains.jpeg" },
  { local: "3.jpeg", s3: "collection/3-produce.jpeg" },
];

async function uploadImages() {
  for (const img of images) {
    try {
      const filePath = path.join("c:/Users/patel/Downloads", img.local);
      const fileContent = fs.readFileSync(filePath);

      const params = {
        Bucket: "carmella-bucket",
        Key: img.s3,
        Body: fileContent,
        ContentType: "image/jpeg",
      };

      await s3Client.send(new PutObjectCommand(params));
      console.log(`✓ Uploaded ${img.local} to ${img.s3}`);
    } catch (error) {
      console.error(`✗ Error uploading ${img.local}:`, error.message);
    }
  }
}

uploadImages();
