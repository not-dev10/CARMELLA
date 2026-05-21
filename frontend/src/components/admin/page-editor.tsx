"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/api"
import { supabase } from "@/lib/supabase"

interface Section {
  id: string
  name: string
  type: "hero" | "quote" | "newsletter" | "testimonials"
  fields: Field[]
}

interface Field {
  name: string
  label: string
  type: "text" | "textarea" | "image" | "image-array" | "select"
  required?: boolean
  rows?: number
  imageType?: "desktop" | "mobile"
  options?: string[]
  maxItems?: number
}

interface SectionData {
  [key: string]: any
}

const SECTIONS: Section[] = [
  {
    id: "hero",
    name: "Hero Section",
    type: "hero",
    fields: [
      { name: "badge", label: "Badge Text (e.g., EST. 2024)", type: "text", required: true },
      { name: "title", label: "Main Title", type: "text", required: true },
      { name: "subtitle", label: "Subtitle Description", type: "textarea", rows: 3, required: true },
      { name: "cta1Text", label: "First CTA Button Text", type: "text", required: true },
      { name: "cta1Link", label: "First CTA Button Link", type: "text", required: false },
      { name: "cta2Text", label: "Second CTA Button Text", type: "text", required: true },
      { name: "cta2Link", label: "Second CTA Button Link", type: "text", required: false },
      { name: "badge1Text", label: "Trust Badge 1 - Main Text", type: "text", required: true },
      { name: "badge1Subtext", label: "Trust Badge 1 - Sub Text", type: "text", required: true },
      { name: "badge2Text", label: "Trust Badge 2 - Main Text", type: "text", required: true },
      { name: "badge2Subtext", label: "Trust Badge 2 - Sub Text", type: "text", required: true },
      { name: "badge3Text", label: "Trust Badge 3 - Main Text", type: "text", required: true },
      { name: "badge3Subtext", label: "Trust Badge 3 - Sub Text", type: "text", required: true },
      { name: "images", label: "Hero Images (Desktop & Mobile)", type: "image-array", required: true, maxItems: 8 },
    ],
  },
  {
    id: "categories",
    name: "Categories Section",
    type: "quote",
    fields: [
      { name: "title", label: "Section Title", type: "text", required: true },
      { name: "description", label: "Section Description", type: "textarea", rows: 2, required: true },
    ],
  },
  {
    id: "collection",
    name: "Collection Split Section",
    type: "quote",
    fields: [
      { name: "leftLabel", label: "Left Panel Label", type: "text", required: true },
      { name: "leftTitle", label: "Left Panel Title", type: "text", required: true },
      { name: "leftButtonText", label: "Left Panel Button", type: "text", required: true },
      { name: "rightLabel", label: "Right Panel Label", type: "text", required: true },
      { name: "rightTitle", label: "Right Panel Title", type: "text", required: true },
      { name: "rightButtonText", label: "Right Panel Button", type: "text", required: true },
    ],
  },
  {
    id: "products",
    name: "Product Showcase Section",
    type: "quote",
    fields: [
      { name: "label", label: "Section Label", type: "text", required: true },
      { name: "title", label: "Section Title", type: "text", required: true },
      { name: "description", label: "Section Description", type: "textarea", rows: 2, required: true },
      { name: "buttonText", label: "View All Button Text", type: "text", required: true },
    ],
  },
  {
    id: "givingback",
    name: "Giving Back Section",
    type: "quote",
    fields: [
      { name: "label", label: "Section Label", type: "text", required: true },
      { name: "title", label: "Section Title", type: "text", required: true },
      { name: "description", label: "Section Description", type: "textarea", rows: 3, required: true },
      { name: "buttonText", label: "Button Text", type: "text", required: true },
    ],
  },
  {
    id: "quote",
    name: "Brand Quote Section",
    type: "quote",
    fields: [
      { name: "quote", label: "Quote Text", type: "textarea", rows: 3, required: true },
      { name: "author", label: "Author Name", type: "text", required: true },
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter Section",
    type: "quote",
    fields: [
      { name: "title", label: "Newsletter Title", type: "text", required: true },
      { name: "description", label: "Newsletter Description", type: "textarea", rows: 2, required: true },
      { name: "placeholder", label: "Email Input Placeholder", type: "text", required: true },
    ],
  },
  {
    id: "testimonials",
    name: "Testimonials Section",
    type: "testimonials",
    fields: [
      { name: "title", label: "Section Title", type: "text", required: true },
      { name: "subtitle", label: "Section Subtitle", type: "textarea", rows: 2, required: true },
    ],
  },
]

export function PageEditor() {
  const [activeSectionId, setActiveSectionId] = useState("hero")
  const [sectionsData, setSectionsData] = useState<Map<string, SectionData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Fetch all section data on mount
  useEffect(() => {
    fetchAllSections()
  }, [])

  const fetchAllSections = async () => {
    try {
      setLoading(true)
      const newData = new Map<string, SectionData>()

      for (const section of SECTIONS) {
        try {
          const response = await fetch(`${API_BASE_URL}/homepage/content/${section.id}`)
          if (response.ok) {
            const content = await response.json()
            newData.set(section.id, content.content || getDefaultData(section.id))
          } else {
            newData.set(section.id, getDefaultData(section.id))
          }
        } catch (error) {
          console.error(`Failed to fetch ${section.id}:`, error)
          newData.set(section.id, getDefaultData(section.id))
        }
      }

      setSectionsData(newData)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultData = (sectionId: string): SectionData => {
    const defaults: { [key: string]: SectionData } = {
      hero: {
        badge: "EST. 2024",
        title: "Artistry in Every Detail",
        subtitle: "Handcrafted ceramics and home essentials for the modern retailer. Elevate your inventory with our curated B2B collections.",
        cta1Text: "Shop Wholesale",
        cta1Link: "/shop",
        cta2Text: "View Lookbook",
        cta2Link: "/lookbook",
        badge1Text: "500+ Retailers",
        badge1Subtext: "Worldwide",
        badge2Text: "Premium Quality",
        badge2Subtext: "Handcrafted",
        badge3Text: "B2B Certified",
        badge3Subtext: "Trusted Partner",
        images: [],
      },
      categories: {
        title: "Browse Our Collections",
        description: "Shop by Category",
      },
      collection: {
        leftLabel: "New Arrivals",
        leftTitle: "Spices & Seasonings",
        leftButtonText: "Shop Collection",
        rightLabel: "Curated",
        rightTitle: "Grains & Cereals",
        rightButtonText: "Discover More",
      },
      products: {
        label: "Featured Products",
        title: "Trending Now",
        description: "Discover our most popular items",
        buttonText: "View All",
      },
      givingback: {
        label: "Community Impact",
        title: "Giving Back to the Community",
        description: "An additional 10% of proceeds from our best-selling Poetry Mug go to charities that support local artisans and fair trade practices.",
        buttonText: "Our Giving Program",
      },
      quote: {
        quote: "Every piece tells a story of craftsmanship and tradition.",
        author: "Carmella Artisans",
      },
      newsletter: {
        title: "Stay Updated",
        description: "Get exclusive offers and new collection announcements",
        placeholder: "Enter your email",
      },
      testimonials: {
        title: "What Our Customers Say",
        subtitle: "Real feedback from our valued clients",
      },
    }
    return defaults[sectionId] || {}
  }

  const uploadToS3 = async (file: File, fieldName: string): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error("Not authenticated - please log in first")
      }

      const signedUrlResponse = await fetch(`${API_BASE_URL}/upload/get-signed-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: `${activeSectionId}-${fieldName}-${Date.now()}.${file.name.split('.').pop()}`,
          fileType: activeSectionId,
        }),
      })

      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json().catch(() => ({}))
        const errorMsg = errorData.error || `Failed to get upload URL (${signedUrlResponse.status})`
        console.error(`[S3] Upload URL error:`, errorData)
        throw new Error(errorMsg)
      }

      const { signedUrl, publicUrl } = await signedUrlResponse.json()

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "image/jpeg",
        },
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      return publicUrl
    } catch (error: any) {
      setMessage({ type: "error", text: `Upload failed: ${error.message}` })
      return null
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" })
      return
    }

    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setMessage({ type: "error", text: "File too large. Maximum size is 10MB" })
      return
    }

    setUploading(fieldName)
    const url = await uploadToS3(file, fieldName)
    setUploading(null)

    if (url) {
      const currentData = sectionsData.get(activeSectionId) || {}
      setSectionsData(new Map(sectionsData).set(activeSectionId, { ...currentData, [fieldName]: url }))
      setMessage({ type: "success", text: "Image uploaded successfully!" })
    }

    // Reset input
    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName]!.value = ""
    }
  }

  const handleImageArrayUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, index: number, imageKey: "desktopImage" | "mobileImage") => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" })
      return
    }

    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setMessage({ type: "error", text: "File too large. Maximum size is 10MB" })
      return
    }

    const uploadKey = `${fieldName}-${index}-${imageKey}`
    setUploading(uploadKey)
    const url = await uploadToS3(file, uploadKey)
    setUploading(null)

    if (url) {
      const currentData = sectionsData.get(activeSectionId) || {}
      const images = currentData[fieldName] || []
      images[index] = { ...images[index], [imageKey]: url }
      setSectionsData(new Map(sectionsData).set(activeSectionId, { ...currentData, [fieldName]: images }))
      setMessage({ type: "success", text: "Image uploaded successfully!" })
    }

    // Reset input
    if (fileInputRefs.current[uploadKey]) {
      fileInputRefs.current[uploadKey]!.value = ""
    }
  }

  const handleAddImageSet = (fieldName: string) => {
    const currentData = sectionsData.get(activeSectionId) || {}
    const images = currentData[fieldName] || []
    images.push({ desktopImage: "", mobileImage: "" })
    setSectionsData(new Map(sectionsData).set(activeSectionId, { ...currentData, [fieldName]: images }))
  }

  const handleRemoveImageSet = (fieldName: string, index: number) => {
    const currentData = sectionsData.get(activeSectionId) || {}
    const images = currentData[fieldName] || []
    images.splice(index, 1)
    setSectionsData(new Map(sectionsData).set(activeSectionId, { ...currentData, [fieldName]: images }))
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    const currentData = sectionsData.get(activeSectionId) || {}
    setSectionsData(new Map(sectionsData).set(activeSectionId, { ...currentData, [fieldName]: value }))
  }

  const handleSaveSection = async () => {
    try {
      const activeSection = SECTIONS.find(s => s.id === activeSectionId)
      if (!activeSection) return

      // Validate required fields
      const currentData = sectionsData.get(activeSectionId) || {}
      for (const field of activeSection.fields) {
        if (field.required && !currentData[field.name]) {
          setMessage({ type: "error", text: `${field.label} is required` })
          return
        }
      }

      setSaving(activeSectionId)

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error("Not authenticated - please log in first")
      }

      console.log(`[PAGE EDITOR] Saving section: ${activeSectionId}`, currentData)

      const response = await fetch(`${API_BASE_URL}/homepage/content/${activeSectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content: currentData }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error(`[PAGE EDITOR] Failed to save section:`, error)
        throw new Error(error.error || "Failed to save section")
      }

      const saveResponse = await response.json()
      console.log(`[PAGE EDITOR] Section saved successfully:`, saveResponse)

      setMessage({ type: "success", text: `${activeSection.name} saved successfully! Changes will appear on the homepage in a few seconds.` })
      
      // Refresh the section data after a short delay to reflect changes
      setTimeout(() => {
        console.log(`[PAGE EDITOR] Refreshing section data after save`)
        fetchAllSections()
      }, 1000)
    } catch (error: any) {
      console.error(`[PAGE EDITOR] Error:`, error)
      setMessage({ type: "error", text: error.message || "Failed to save section" })
    } finally {
      setSaving(null)
    }
  }

  const activeSection = SECTIONS.find(s => s.id === activeSectionId)
  const currentData = sectionsData.get(activeSectionId) || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="admin-heading">Complete Page Editor</h2>
          <p className="text-muted-foreground">Edit all homepage sections in one place. Changes are saved individually.</p>
        </div>
        <Button
          onClick={fetchAllSections}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              ↻ Refresh Data
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading page content...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Section Navigation */}
          <div className="lg:col-span-1">
            <div className="admin-card p-0 overflow-hidden sticky top-8">
              <div className="p-4 bg-muted dark:bg-gray-800 border-b border-border dark:border-gray-700">
                <h3 className="font-semibold text-foreground text-sm">Sections</h3>
              </div>
              <div className="divide-y divide-border dark:divide-gray-700">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm font-medium transition-colors",
                      activeSectionId === section.id
                        ? "bg-primary/10 dark:bg-primary/20 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-muted dark:hover:bg-gray-800 border-l-2 border-transparent"
                    )}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Section Editor */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeSection && (
                <motion.div
                  key={activeSectionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="admin-card p-6 space-y-6"
                >
                  {/* Section Header */}
                  <div>
                    <h3 className="font-serif text-2xl text-foreground mb-2">{activeSection.name}</h3>
                    <p className="text-sm text-muted-foreground">Edit the fields below to update this section on your homepage.</p>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    {activeSection.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="admin-label">{field.label}</label>
                          {field.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                        </div>

                        {/* Text Input */}
                        {field.type === "text" && (
                          <input
                            type="text"
                            value={currentData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="admin-input"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}

                        {/* Textarea */}
                        {field.type === "textarea" && (
                          <textarea
                            value={currentData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="admin-input"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            rows={field.rows || 3}
                          />
                        )}

                        {/* Image Array Upload */}
                        {field.type === "image-array" && (
                          <div className="space-y-4">
                            {/* Image Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              {(currentData[field.name] || []).map((imageSet: any, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Image {index + 1}</div>
                                  
                                  {/* Desktop Image */}
                                  <div
                                    onClick={() => fileInputRefs.current[`${field.name}-${index}-desktop`]?.click()}
                                    className={cn(
                                      "border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer",
                                      uploading === `${field.name}-${index}-desktop` ? "opacity-50 cursor-wait" : "",
                                      "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50 hover:border-gray-400"
                                    )}
                                  >
                                    <input
                                      ref={(el) => {
                                        if (el) fileInputRefs.current[`${field.name}-${index}-desktop`] = el
                                      }}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageArrayUpload(e, field.name, index, "desktopImage")}
                                      disabled={uploading === `${field.name}-${index}-desktop`}
                                      className="hidden"
                                    />
                                    
                                    {imageSet.desktopImage ? (
                                      <div className="space-y-2">
                                        <div className="relative w-full rounded bg-gray-100 dark:bg-gray-900" style={{ aspectRatio: "16/9" }}>
                                          <img
                                            src={imageSet.desktopImage}
                                            alt="Desktop"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <p className="text-xs font-medium">Desktop</p>
                                      </div>
                                    ) : (
                                      <div className="py-4">
                                        <p className="text-xs font-medium">Desktop (16:9)</p>
                                        <p className="text-xs text-gray-500 mt-1">Click to upload</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Mobile Image */}
                                  <div
                                    onClick={() => fileInputRefs.current[`${field.name}-${index}-mobile`]?.click()}
                                    className={cn(
                                      "border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer",
                                      uploading === `${field.name}-${index}-mobile` ? "opacity-50 cursor-wait" : "",
                                      "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50 hover:border-gray-400"
                                    )}
                                  >
                                    <input
                                      ref={(el) => {
                                        if (el) fileInputRefs.current[`${field.name}-${index}-mobile`] = el
                                      }}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageArrayUpload(e, field.name, index, "mobileImage")}
                                      disabled={uploading === `${field.name}-${index}-mobile`}
                                      className="hidden"
                                    />
                                    
                                    {imageSet.mobileImage ? (
                                      <div className="space-y-2">
                                        <div className="relative w-full rounded bg-gray-100 dark:bg-gray-900" style={{ aspectRatio: "3/4" }}>
                                          <img
                                            src={imageSet.mobileImage}
                                            alt="Mobile"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <p className="text-xs font-medium">Mobile</p>
                                      </div>
                                    ) : (
                                      <div className="py-4">
                                        <p className="text-xs font-medium">Mobile (3:4)</p>
                                        <p className="text-xs text-gray-500 mt-1">Click to upload</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Remove Button */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-full text-red-600 hover:text-red-700"
                                    onClick={() => handleRemoveImageSet(field.name, index)}
                                  >
                                    Remove Image {index + 1}
                                  </Button>
                                </div>
                              ))}
                            </div>
                            
                            {/* Add Image Button */}
                            {(!currentData[field.name] || currentData[field.name].length < (field.maxItems || 8)) && (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleAddImageSet(field.name)}
                              >
                                + Add Image (Max {field.maxItems || 8})
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Image Upload */}
                        {field.type === "image" && (
                          <div
                            onClick={() => fileInputRefs.current[field.name]?.click()}
                            className={cn(
                              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                              uploading === field.name ? "opacity-50 cursor-wait" : "",
                              "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50 hover:border-gray-400"
                            )}
                          >
                            <input
                              ref={(el) => {
                                if (el) fileInputRefs.current[field.name] = el
                              }}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, field.name)}
                              disabled={uploading === field.name}
                              className="hidden"
                            />

                            {currentData[field.name] ? (
                              <div className="space-y-3">
                                <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900" style={{ aspectRatio: field.imageType === "mobile" ? "3/4" : "16/9" }}>
                                  <img
                                    src={currentData[field.name]}
                                    alt={field.label}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      fileInputRefs.current[field.name]?.click()
                                    }}
                                  >
                                    Change
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleFieldChange(field.name, "")
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-2 py-8">
                                {uploading === field.name ? (
                                  <>
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    <p className="text-sm text-muted-foreground">Uploading...</p>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <p className="text-sm font-medium">Drag image here or click to upload</p>
                                    <p className="text-xs text-muted-foreground">
                                      {field.imageType === "mobile" ? "Recommended: 540x720px" : "Recommended: 1920x1080px"}
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
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
                    onClick={handleSaveSection}
                    disabled={saving !== null || uploading !== null}
                    className="btn-gradient w-full"
                  >
                    {saving === activeSectionId ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save {activeSection.name}
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
