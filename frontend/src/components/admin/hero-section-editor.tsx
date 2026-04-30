"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Loader2, Save, Monitor, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/api"
import { supabase } from "@/lib/supabase"

interface HeroSectionEditorProps {
  onSave?: (heroData: HeroSectionData) => Promise<void>
  initialData?: HeroSectionData
}

export interface HeroSectionData {
  title: string
  subtitle: string
  desktopImage: string
  mobileImage: string
}

export function HeroSectionEditor({ onSave, initialData }: HeroSectionEditorProps) {
  const [heroData, setHeroData] = useState<HeroSectionData>({
    title: initialData?.title || "Handcrafted Ceramics for Modern Living",
    subtitle: initialData?.subtitle || "Discover our curated collection of artisan ceramics",
    desktopImage: initialData?.desktopImage || "",
    mobileImage: initialData?.mobileImage || "",
  })

  const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(null)
  const [draggedOver, setDraggedOver] = useState<"desktop" | "mobile" | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const desktopInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  const uploadToS3 = async (file: File, type: "desktop" | "mobile"): Promise<string | null> => {
    try {
      console.log("[S3] Upload starting:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        imageType: type,
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
          filename: `hero-${type}-${Date.now()}.${file.name.split('.').pop()}`,
          fileType: "hero",
        }),
      })

      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json()
        console.error("[S3] Failed to get signed URL:", errorData)
        throw new Error(errorData.error || `Failed to get upload URL (${signedUrlResponse.status})`)
      }

      const { signedUrl, publicUrl } = await signedUrlResponse.json()
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
      setMessage({ type: "error", text: `Upload failed: ${error.message || "Unknown error"}` })
      return null
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" })
      return
    }

    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      setMessage({ type: "error", text: `File too large. Maximum size is 10MB` })
      return
    }

    // Upload to S3
    setUploading(type)
    const url = await uploadToS3(file, type)
    setUploading(null)

    if (url) {
      setHeroData((prev) => ({
        ...prev,
        [type === "desktop" ? "desktopImage" : "mobileImage"]: url,
      }))
      setMessage({ type: "success", text: `${type === "desktop" ? "Desktop" : "Mobile"} image uploaded successfully!` })

      // Reset input
      if (type === "desktop" && desktopInputRef.current) {
        desktopInputRef.current.value = ""
      } else if (type === "mobile" && mobileInputRef.current) {
        mobileInputRef.current.value = ""
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, type: "desktop" | "mobile") => {
    e.preventDefault()
    if (!uploading) {
      setDraggedOver(type)
    }
  }

  const handleDragLeave = () => {
    setDraggedOver(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: "desktop" | "mobile") => {
    e.preventDefault()
    setDraggedOver(null)

    if (uploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(
        {
          target: { files: e.dataTransfer.files },
        } as any,
        type
      )
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      if (!heroData.title || !heroData.subtitle) {
        setMessage({ type: "error", text: "Title and subtitle are required" })
        setSaving(false)
        return
      }

      if (!heroData.desktopImage || !heroData.mobileImage) {
        setMessage({ type: "error", text: "Both desktop and mobile images are required" })
        setSaving(false)
        return
      }

      if (onSave) {
        await onSave(heroData)
      }

      setMessage({ type: "success", text: "Hero section updated successfully!" })
    } catch (error: any) {
      setMessage({ type: "error", text: `Save failed: ${error.message || "Unknown error"}` })
    } finally {
      setSaving(false)
    }
  }

  const removeImage = (type: "desktop" | "mobile") => {
    setHeroData((prev) => ({
      ...prev,
      [type === "desktop" ? "desktopImage" : "mobileImage"]: "",
    }))
  }

  return (
    <div className="space-y-6">
      {/* Title and Subtitle */}
      <div className="space-y-4">
        <div>
          <label className="admin-label">Hero Title</label>
          <input
            type="text"
            value={heroData.title}
            onChange={(e) => setHeroData((prev) => ({ ...prev, title: e.target.value }))}
            className="admin-input"
            placeholder="Enter hero section title"
          />
        </div>

        <div>
          <label className="admin-label">Hero Subtitle</label>
          <textarea
            value={heroData.subtitle}
            onChange={(e) => setHeroData((prev) => ({ ...prev, subtitle: e.target.value }))}
            className="admin-input"
            placeholder="Enter hero section subtitle"
            rows={2}
          />
        </div>
      </div>

      {/* Image Upload Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desktop Image */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Desktop Image</h3>
            <Badge variant="outline" className="text-xs">Required</Badge>
          </div>

          <div
            onDragOver={(e) => handleDragOver(e, "desktop")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "desktop")}
            onClick={() => !uploading && desktopInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              uploading === "desktop" ? "opacity-50 cursor-wait" : "",
              draggedOver === "desktop"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50 hover:border-gray-400"
            )}
          >
            <input
              ref={desktopInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "desktop")}
              disabled={uploading === "desktop"}
              className="hidden"
            />

            {heroData.desktopImage ? (
              <div className="space-y-3">
                <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-video">
                  <img
                    src={heroData.desktopImage}
                    alt="Desktop preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      desktopInputRef.current?.click()
                    }}
                  >
                    Change Image
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage("desktop")
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                {uploading === "desktop" ? (
                  <>
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium">Drag image here or click to upload</p>
                    <p className="text-xs text-muted-foreground">Recommended: 1920x1080px or larger</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Image */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold text-foreground">Mobile Image</h3>
            <Badge variant="outline" className="text-xs">Required</Badge>
          </div>

          <div
            onDragOver={(e) => handleDragOver(e, "mobile")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "mobile")}
            onClick={() => !uploading && mobileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              uploading === "mobile" ? "opacity-50 cursor-wait" : "",
              draggedOver === "mobile"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50 hover:border-gray-400"
            )}
          >
            <input
              ref={mobileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "mobile")}
              disabled={uploading === "mobile"}
              className="hidden"
            />

            {heroData.mobileImage ? (
              <div className="space-y-3">
                <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-square">
                  <img
                    src={heroData.mobileImage}
                    alt="Mobile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      mobileInputRef.current?.click()
                    }}
                  >
                    Change Image
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage("mobile")
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                {uploading === "mobile" ? (
                  <>
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium">Drag image here or click to upload</p>
                    <p className="text-xs text-muted-foreground">Recommended: 540x720px or similar</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-lg text-sm font-medium",
              message.type === "success"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            )}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving || uploading !== null}
        className="btn-gradient w-full"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Hero Section
          </>
        )}
      </Button>
    </div>
  )
}
