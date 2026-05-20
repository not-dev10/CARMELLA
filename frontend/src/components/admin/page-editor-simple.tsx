"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/api"
import { supabase } from "@/lib/supabase"

interface Section {
  id: string
  name: string
  fields: { name: string; label: string; type: "text" | "textarea" }[]
}

interface SectionData {
  [key: string]: any
}

const SECTIONS: Section[] = [
  {
    id: "hero",
    name: "Hero Section",
    fields: [
      { name: "title", label: "Main Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "cta1Text", label: "Button 1 Text", type: "text" },
      { name: "cta2Text", label: "Button 2 Text", type: "text" },
    ],
  },
  {
    id: "categories",
    name: "Categories Section",
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    id: "products",
    name: "Product Showcase",
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "buttonText", label: "Button Text", type: "text" },
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter Section",
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
]

export function PageEditor() {
  const [activeSectionId, setActiveSectionId] = useState("hero")
  const [sectionsData, setSectionsData] = useState<Map<string, SectionData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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
            newData.set(section.id, content.content || {})
          } else {
            newData.set(section.id, {})
          }
        } catch (error) {
          console.error(`Failed to fetch ${section.id}:`, error)
          newData.set(section.id, {})
        }
      }

      setSectionsData(newData)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    const currentData = sectionsData.get(activeSectionId) || {}
    setSectionsData(new Map(sectionsData).set(activeSectionId, { ...currentData, [fieldName]: value }))
  }

  const handleSaveSection = async () => {
    try {
      const activeSection = SECTIONS.find(s => s.id === activeSectionId)
      if (!activeSection) return

      setSaving(activeSectionId)
      const currentData = sectionsData.get(activeSectionId) || {}

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error("Not authenticated")
      }

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
        throw new Error(error.error || "Failed to save")
      }

      setMessage({ type: "success", text: "Saved successfully!" })
      setTimeout(() => fetchAllSections(), 1000)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save" })
    } finally {
      setSaving(null)
    }
  }

  const activeSection = SECTIONS.find(s => s.id === activeSectionId)
  const currentData = sectionsData.get(activeSectionId) || {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="admin-heading">Homepage Editor</h2>
        <p className="text-muted-foreground">Simple content editing for your homepage sections.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="admin-card p-0 overflow-hidden sticky top-8">
              <div className="p-4 bg-muted dark:bg-gray-800 border-b border-border dark:border-gray-700">
                <h3 className="font-semibold text-sm">Sections</h3>
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

          {/* Main Editor */}
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
                  <div>
                    <h3 className="font-serif text-2xl text-foreground mb-2">{activeSection.name}</h3>
                  </div>

                  {/* Message */}
                  {message && (
                    <div className={cn(
                      "p-3 rounded-lg text-sm",
                      message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {message.text}
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4">
                    {activeSection.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className="admin-label">{field.label}</label>

                        {field.type === "text" && (
                          <input
                            type="text"
                            value={currentData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="admin-input"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}

                        {field.type === "textarea" && (
                          <textarea
                            value={currentData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="admin-input"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            rows={3}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveSection}
                    disabled={saving === activeSectionId}
                    className="w-full"
                  >
                    {saving === activeSectionId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
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
