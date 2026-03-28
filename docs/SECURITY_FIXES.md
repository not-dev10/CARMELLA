# Security Advisory: Image Upload & Database Considerations

## 🔐 Security Issue: Unsigned Cloudinary Uploads

### Problem
The current implementation uses **unsigned Cloudinary uploads**, which exposes your Cloudinary account to potential abuse:

- **Account takeover risk**: Attackers can abuse your upload quota
- **Malicious files**: No server-side validation before upload
- **Rate limiting**: Unsigned uploads are vulnerable to DoS attacks
- **Cost**: Unlimited uploads could result in unexpected charges

### Recommended Solution: Signed Uploads

Replace unsigned uploads with signed uploads that require backend authentication.

#### Step 1: Update Backend to Generate Signatures

Create a new API endpoint in `backend/src/routes/files.ts`:

```typescript
import { Request, Response } from "express";
import { requireAuth, adminOnly } from "../middleware/index.js";
import crypto from "crypto";
import { config } from "../config/index.js";

export async function getCloudinarySignature(req: Request, res: Response) {
  try {
    requireAuth(req); // Ensure user is logged in
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiSecret) {
      return res.status(500).json({ error: "Cloudinary credentials not configured" });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `carmella/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create signature
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

    return res.json({
      signature,
      timestamp,
      publicId,
      cloudName,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

#### Step 2: Update Frontend Image Manager

Replace ImageManager to use signed uploads:

```typescript
const getSignatureAndUpload = async (file: File) => {
  try {
    // Get signature from backend (requires auth)
    const signResponse = await fetch('/api/files/cloudinary-signature', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (!signResponse.ok) throw new Error('Failed to get signature');
    
    const { signature, timestamp, publicId, cloudName } = await signResponse.json();
    
    // Upload with signature
    const formData = new FormData();
    formData.append("file", file);
    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", process.env.VITE_CLOUDINARY_API_KEY);
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    
    return uploadResponse.json();
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
```

#### Step 3: Update Environment Variables

**Backend (.env)**:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend (.env.local)**:
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
```

### Benefits of Signed Uploads
✅ Only authenticated users can upload
✅ Backend controls upload quotas and rate limits
✅ Protected against account abuse
✅ Full audit trail of uploads
✅ Can enforce file restrictions server-side

---

## ⚠️ Database Concern: ON DELETE CASCADE

### Issue
The `fix-order-items-cascade.sql` migration adds `ON DELETE CASCADE` to the `order_items.product_id` foreign key. This means:

**If a product is deleted, all associated order items are automatically deleted.**

### Implications

#### ❌ Risks
- **Data Loss**: Historical order data is permanently deleted
- **Audit Trail Loss**: Cannot track what was ordered
- **Financial Records**: May violate accounting requirements
- **Compliance**: Could violate GDPR/data retention policies

#### ✅ Conservative Alternative: Soft Delete

Instead of CASCADE, implement soft deletes:

```sql
-- Step 1: Add is_active column to products (if not exists)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Step 2: Update RLS policies to filter out deleted products
CREATE POLICY "products_select_not_deleted" ON public.products
  FOR SELECT USING (is_deleted = false);

-- Step 3: Use UPDATE instead of DELETE
UPDATE public.products 
SET is_deleted = true 
WHERE id = 'product-id';

-- Step 4: Remove CASCADE - use SET NULL instead
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE SET NULL;
```

**Benefits of Soft Delete**:
✅ Preserves historical data
✅ Products remain in orders for audit purposes
✅ Can restore deleted products
✅ Complies with data retention laws
✅ Better for analytics

### Recommendation
Consider changing to soft delete model if you need historical order data. Update the `fix-order-items-cascade.sql` to use `ON DELETE SET NULL` instead.

---

## 📋 Summary of Security Fixes

| Issue | Status | Action |
|-------|--------|--------|
| File size validation | ✅ Fixed | Added 10MB limit enforcement |
| Drag-drop disabled state | ✅ Fixed | Respects disabled/uploading flags |
| Stale closure in uploads | ✅ Fixed | Sequential upload with proper state |
| State race condition | ✅ Fixed | Batch state updates |
| Debug logging | ✅ Fixed | Removed console.log, kept errors only |
| SQL transactions | ✅ Fixed | Wrapped migration in BEGIN/COMMIT |
| Unsigned uploads | ⚠️ Document | See signed upload alternative above |
| CASCADE delete | ⚠️ Review | Consider soft delete approach |

---

## 🚀 Next Steps

1. **Immediate**: Apply fixes to `image-manager.tsx` and SQL migrations
2. **Short-term**: Implement signed Cloudinary uploads
3. **Long-term**: Review data retention policy and consider soft delete model

For questions or implementation help, refer to the [IMAGE_UPLOAD_SETUP.md](../IMAGE_UPLOAD_SETUP.md) documentation.
