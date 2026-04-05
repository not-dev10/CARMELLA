import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config/index.js";
import crypto from "crypto";

// Initialize S3 client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

/**
 * Generate a unique key for S3 object based on file type
 * Example output: carmella/products/abc123-uuid.jpg
 */
export function generateS3Key(fileType: "product" | "category", filename: string): string {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(8).toString("hex");
  const ext = filename.split(".").pop() || "jpg";
  return `carmella/${fileType}/${timestamp}-${randomStr}.${ext}`;
}

/**
 * Get signed URL for uploading to S3
 * Returns a presigned POST URL for browser-based uploads
 */
export async function getS3UploadUrl(key: string): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
      ContentType: "image/*",
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
    return signedUrl;
  } catch (error) {
    console.error("[S3] Error generating upload URL:", error);
    throw error;
  }
}

/**
 * Get public S3 URL for an object
 */
export function getS3PublicUrl(key: string): string {
  return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
}

/**
 * Extract key from full S3 URL
 * Example: https://bucket.s3.region.amazonaws.com/carmella/products/123.jpg -> carmella/products/123.jpg
 */
export function extractS3Key(s3Url: string): string | null {
  if (!s3Url || !s3Url.includes(".s3.")) {
    return null;
  }

  try {
    const url = new URL(s3Url);
    // Remove leading slash from pathname
    return url.pathname.slice(1);
  } catch (error) {
    console.error("[S3] Error extracting key from URL:", error);
    return null;
  }
}

/**
 * Delete single image from S3
 */
export async function deleteFromS3(imageUrl: string): Promise<boolean> {
  const key = extractS3Key(imageUrl);

  if (!key) {
    console.log("[S3] No valid key found in URL:", imageUrl);
    return false;
  }

  try {
    console.log(`[S3] Deleting object with key: ${key}`);

    const command = new DeleteObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`[S3] Successfully deleted: ${key}`);
    return true;
  } catch (error) {
    console.error(`[S3] Error deleting object:`, error);
    return false;
  }
}

/**
 * Delete multiple images from S3
 */
export async function deleteMultipleFromS3(imageUrls: string[]): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  const total = imageUrls.length;
  let success = 0;
  let failed = 0;

  if (total === 0) {
    return { success: 0, failed: 0, total: 0 };
  }

  try {
    // Extract all keys
    const keys = imageUrls
      .map((url) => extractS3Key(url))
      .filter((key): key is string => key !== null);

    if (keys.length === 0) {
      console.log("[S3] No valid S3 keys found in URLs");
      return { success: 0, failed: total, total };
    }

    // Delete in batches (S3 allows up to 1000 objects per request)
    const batchSize = 1000;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);

      const command = new DeleteObjectsCommand({
        Bucket: config.aws.bucketName,
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
        },
      });

      const response = await s3Client.send(command);

      // Count successes and failures
      if (response.Deleted) {
        success += response.Deleted.length;
      }
      if (response.Errors) {
        failed += response.Errors.length;
        console.error("[S3] Delete errors:", response.Errors);
      }
    }

    console.log(`[S3] Batch delete summary: ${success} succeeded, ${failed} failed`);
    return { success, failed, total };
  } catch (error) {
    console.error("[S3] Error batch deleting objects:", error);
    return { success, failed: total - success, total };
  }
}

/**
 * Upload buffer/stream to S3
 */
export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  try {
    console.log(`[S3] Uploading object with key: ${key}`);

    const command = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);
    const url = getS3PublicUrl(key);
    console.log(`[S3] Successfully uploaded: ${url}`);
    return url;
  } catch (error) {
    console.error(`[S3] Error uploading object:`, error);
    throw error;
  }
}
