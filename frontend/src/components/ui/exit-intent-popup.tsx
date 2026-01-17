"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false)
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        // Check if user has already seen the popup
        const hasSeenPopup = localStorage.getItem("exitIntentSeen")
        if (hasSeenPopup) return

        let hasTriggered = false

        const handleMouseLeave = (e: MouseEvent) => {
            // Trigger when mouse leaves from top of viewport
            if (e.clientY <= 0 && !hasTriggered) {
                hasTriggered = true
                setIsVisible(true)
                localStorage.setItem("exitIntentSeen", "true")
            }
        }

        // Add delay before enabling exit intent
        const timer = setTimeout(() => {
            document.addEventListener("mouseleave", handleMouseLeave)
        }, 5000) // Wait 5 seconds before enabling

        return () => {
            clearTimeout(timer)
            document.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true)
            setTimeout(() => {
                setIsVisible(false)
            }, 2000)
        }, 500)
    }

    const handleClose = () => {
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md"
                    >
                        <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {isSubmitted ? (
                                // Success State
                                <div className="p-12 text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
                                    >
                                        <Gift className="w-10 h-10 text-primary" />
                                    </motion.div>
                                    <h3 className="font-serif text-2xl font-semibold mb-2">
                                        Welcome to the Club!
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Check your inbox for your exclusive discount code.
                                    </p>
                                </div>
                            ) : (
                                // Form State
                                <>
                                    {/* Header with Gradient */}
                                    <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 p-8 text-center">
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                                        >
                                            <Mail className="w-8 h-8 text-primary" />
                                        </motion.div>
                                        <h2 className="font-serif text-3xl font-bold mb-2">
                                            Wait! Don't Leave Yet
                                        </h2>
                                        <p className="text-muted-foreground">
                                            Get <span className="font-bold text-primary">15% off</span> your first wholesale order
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <div className="p-8">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label htmlFor="exit-email" className="block text-sm font-medium mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="exit-email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    placeholder="you@company.com"
                                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                />
                                            </div>

                                            <Button type="submit" size="lg" className="w-full">
                                                Claim My Discount
                                            </Button>

                                            <p className="text-xs text-center text-muted-foreground">
                                                By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                                            </p>
                                        </form>

                                        {/* Benefits */}
                                        <div className="mt-6 pt-6 border-t border-border">
                                            <p className="text-sm font-semibold mb-3">You'll also get:</p>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-0.5">✓</span>
                                                    <span>Exclusive wholesale pricing updates</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-0.5">✓</span>
                                                    <span>Early access to new collections</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-0.5">✓</span>
                                                    <span>B2B tips and industry insights</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
