import { motion } from "framer-motion"
import { CheckCircle, Reply } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CONTACT_SUBMISSIONS = [
  { id: 1, name: "John Smith", email: "john@example.com", subject: "Bulk Order Inquiry", message: "Interested in wholesale pricing for 500+ units", date: "Jan 24, 2024", status: "new" },
  { id: 2, name: "Lisa Chen", email: "lisa@gallery.com", subject: "Product Customization", message: "Can we customize colors for our gallery?", date: "Jan 23, 2024", status: "read" },
  { id: 3, name: "Robert Brown", email: "robert@design.com", subject: "Partnership Opportunity", message: "Would like to discuss collaboration", date: "Jan 22, 2024", status: "responded" },
  { id: 4, name: "Maria Garcia", email: "maria@store.com", subject: "Shipping Question", message: "What are the shipping costs to Spain?", date: "Jan 21, 2024", status: "new" }
]

export function ContactsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tight text-gray-800 mb-2">Contact Form Submissions</h2>
        <p className="text-gray-500">Review and respond to customer inquiries.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {CONTACT_SUBMISSIONS.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow",
              contact.status === "new" ? "border-l-4 border-l-secondary" : "border-gray-200"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-serif text-lg text-gray-800">{contact.name}</h3>
                  <Badge className={cn(
                    "text-xs font-bold",
                    contact.status === "new" ? "bg-secondary/10 text-secondary" :
                    contact.status === "read" ? "bg-blue-100 text-blue-700" :
                    "bg-green-100 text-green-700"
                  )}>
                    {contact.status === "new" ? "New" : contact.status === "read" ? "Read" : "Responded"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Email:</span> {contact.email}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-semibold">Subject:</span> {contact.subject}
                </p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3 italic">
                  "{contact.message}"
                </p>
                <p className="text-xs text-gray-500">{contact.date}</p>
              </div>
              <div className="flex gap-2">
                <Button className="btn-gradient text-sm">
                  <Reply className="w-4 h-4 mr-1" />
                  Reply
                </Button>
                <button className="p-2 text-gray-500 hover:text-primary transition-colors">
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
