"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Upload, X, GripVertical, Image as ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

interface ImageManagerProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

interface S3UploadResponse {
  signedUrl: string
  publicUrl: string
  key: string
}

export function ImageManager({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false
}: ImageManagerProps) {
  const [draggedOver, setDraggedOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localImages, setLocalImages] = useState(images)

  useEffect(() => {
    setLocalImages(images)
  }, [images])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled && !uploading) {
      setDraggedOver(true)
    }
  }

  const handleDragLeave = () => {
    setDraggedOver(false)
  }

  const uploadToS3 = async (file: File): Promise<string | null> => {
    try {
      console.log("[S3] Upload starting:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      })

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        throw new Error("Not authenticated - please log in first")
      }
      
      // Step 1: Get signed URL from backend
      console.log("[S3] Requesting signed upload URL...")
      const signedUrlResponse = await fetch(`${API_BASE_URL}/upload/get-signed-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: "product", // Can be "product" or "category"
        }),
      })

      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json()
        console.error("[S3] Failed to get signed URL:", errorData)
        throw new Error(errorData.error || `Failed to get upload URL (${signedUrlResponse.status})`)
      }

      const { signedUrl, publicUrl }: S3UploadResponse = await signedUrlResponse.json()
      console.log("[S3] Got signed URL, uploading file...")

      // Step 2: Upload file to S3 using signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "image/jpeg",
        },
      })

      console.log("[S3] Upload response status:", uploadResponse.status, uploadResponse.statusText)

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error("[S3] Upload error response:", errorText)
        throw new Error(`Upload failed (${uploadResponse.status})`)
      }

      console.log("[S3] Upload success:", publicUrl)
      return publicUrl
    } catch (error: any) {
      console.error("[S3] Upload error:", error.message || error)
      return null
    }
  }

  const handleFileSelect = async (files: FileList) => {
    const MAX_FILE_SIZE_MB = 10
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

    if (localImages.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, maxImages - localImages.length)
    const validFiles: File[] = []

    // Validate all files before uploading
    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        alert(`"${file.name}" is not a valid image file`)
        continue
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`"${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Upload files sequentially to avoid race conditions
    setUploading(true)
    const uploadedUrls: string[] = []

    for (const file of validFiles) {
      try {
        const url = await uploadToS3(file)
        if (url) {
          uploadedUrls.push(url)
        } else {
          alert(`Failed to upload "${file.name}" - Check console for details`)
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        alert(`Error uploading "${file.name}": ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    setUploading(false)

    // Update state once with all uploaded images
    if (uploadedUrls.length > 0) {
      const newImages = [...localImages, ...uploadedUrls]
      setLocalImages(newImages)
      onImagesChange(newImages)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDraggedOver(false)
    
    // Respect disabled and uploading state
    if (disabled || uploading) {
      return
    }
    
    handleFileSelect(e.dataTransfer.files)
  }

  const removeImage = (index: number) => {
    const newImages = localImages.filter((_, i) => i !== index)
    setLocalImages(newImages)
    onImagesChange(newImages)
  }

  const handleReorder = (newOrder: string[]) => {
    setLocalImages(newOrder)
    onImagesChange(newOrder)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Product Images ({localImages.length}/{maxImages})</div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          disabled || uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          draggedOver && !disabled && !uploading
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50 hover:border-gray-400"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-medium">Drag images here or click to select</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
            </>
          )}
        </div>
      </div>

      {/* Images Grid */}
      {localImages.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Drag to reorder • Click X to remove
          </div>

          <Reorder.Group
            axis="y"
            values={localImages}
            onReorder={handleReorder}
            className="space-y-2"
          >
            <AnimatePresence>
              {localImages.map((image, index) => (
                <Reorder.Item key={image} value={image} as="div">
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 group cursor-grab active:cursor-grabbing"
                  >
                    {/* Drag Handle */}
                    <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-400 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Image Thumbnail */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Image {index + 1}
                      </p>
                      {index === 0 && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeImage(index)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}

      {/* Empty State */}
      {localImages.length === 0 && !uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No images added yet</p>
        </motion.div>
      )}
    </div>
  )
}
