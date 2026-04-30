import { Request, Response } from "express";
import { generateS3Key, getS3UploadUrl, getS3PublicUrl } from "../utils/s3.js";

/**
 * Get presigned S3 upload URL
 * POST /api/upload/get-signed-url
 * Body: { filename: string, fileType: "product" | "category" | "hero" | "quote" | "newsletter" | "testimonials" }
 */
export async function getSignedUploadUrl(req: Request, res: Response) {
  try {
    const { filename, fileType } = req.body;

    if (!filename || !fileType) {
      return res.status(400).json({ error: "Missing filename or fileType" });
    }

    const validFileTypes = ["product", "category", "hero", "quote", "newsletter", "testimonials"];
    if (!validFileTypes.includes(fileType)) {
      return res.status(400).json({ error: `Invalid fileType. Must be one of: ${validFileTypes.join(", ")}` });
    }

    // Generate S3 key and get signed URL
    const key = generateS3Key(fileType, filename);
    const signedUrl = await getS3UploadUrl(key);
    const publicUrl = getS3PublicUrl(key);

    return res.json({
      signedUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    console.error("[UPLOAD] Error generating signed URL:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Upload file directly to S3 with presigned URL
 * This endpoint can be called by the frontend with the signed URL
 * PUT /api/upload/file
 * Headers: Authorization from signed URL
 */
export async function uploadFileToS3(req: Request, res: Response) {
  try {
    // This endpoint is primarily for getting the signed URL
    // The actual upload happens client-side with the signed URL
    return res.status(200).json({ message: "Use the signed URL to upload directly to S3" });
  } catch (error: any) {
    console.error("[UPLOAD] Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
