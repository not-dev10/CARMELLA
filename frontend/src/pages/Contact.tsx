"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { cn } from "@/lib/utils"

const CONTACT_INFO = [
    {
        icon: Mail,
        title: "Email",
        value: "wholesale@carmella.com",
        link: "mailto:wholesale@carmella.com"
    },
    {
        icon: Phone,
        title: "Phone",
        value: "+1 (555) 123-4567",
        link: "tel:+15551234567"
    },
    {
        icon: MapPin,
        title: "Address",
        value: "123 Ceramic Lane, Portland, OR 97201",
        link: "https://maps.google.com"
    },
    {
        icon: Clock,
        title: "Business Hours",
        value: "Mon-Fri: 9AM-6PM PST",
        link: null
    }
]

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
        inquiryType: "general"
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSubmitted(true)

        // Reset form after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false)
            setFormData({
                name: "",
                email: "",
                company: "",
                phone: "",
                message: "",
                inquiryType: "general"
            })
        }, 3000)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-muted/30 py-16 px-6">
                <div className="container mx-auto text-center">
                    <FadeIn>
                        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 block">
                            Get in Touch
                        </span>
                        <h1 className="font-serif text-5xl md:text-6xl font-medium mb-4">Contact Us</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Have questions about wholesale pricing or custom orders? We're here to help.
                        </p>
                    </FadeIn>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Form */}
                    <FadeIn>
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <h2 className="font-serif text-3xl font-semibold mb-6">Send us a Message</h2>

                            {isSubmitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-semibold mb-2">Message Sent!</h3>
                                    <p className="text-muted-foreground">
                                        We'll get back to you within 24 hours.
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="company" className="block text-sm font-medium mb-2">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                id="company"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                placeholder="Your Company"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="inquiryType" className="block text-sm font-medium mb-2">
                                            Inquiry Type
                                        </label>
                                        <select
                                            id="inquiryType"
                                            name="inquiryType"
                                            value={formData.inquiryType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        >
                                            <option value="general">General Inquiry</option>
                                            <option value="wholesale">Wholesale Pricing</option>
                                            <option value="custom">Custom Orders</option>
                                            <option value="support">Customer Support</option>
                                            <option value="partnership">Partnership Opportunities</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                            placeholder="Tell us about your needs..."
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                                />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </FadeIn>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <FadeIn delay={0.2}>
                            <div>
                                <h2 className="font-serif text-3xl font-semibold mb-6">Contact Information</h2>
                                <div className="space-y-6">
                                    {CONTACT_INFO.map((info, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <info.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">{info.title}</h3>
                                                {info.link ? (
                                                    <a
                                                        href={info.link}
                                                        className="text-muted-foreground hover:text-primary transition-colors"
                                                        target={info.link.startsWith('http') ? '_blank' : undefined}
                                                        rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                    >
                                                        {info.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-muted-foreground">{info.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
                                <h3 className="font-serif text-2xl font-semibold mb-4">Wholesale Inquiries</h3>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Interested in becoming a wholesale partner? We offer competitive pricing,
                                    flexible MOQs, and dedicated account management for qualified retailers.
                                </p>
                                <a
                                    href="/catalog"
                                    className="inline-flex items-center text-primary font-medium hover:underline"
                                >
                                    Browse Our Catalog →
                                </a>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.4}>
                            <div className="aspect-video rounded-2xl overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2795.3033654340484!2d-122.67648668444!3d45.52306997910162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5495a0b4b3b3b3b3%3A0x1!2sPortland%2C%20OR!5e0!3m2!1sen!2sus!4v1234567890123"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Carmella Location"
                                />
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </div>
    )
}
