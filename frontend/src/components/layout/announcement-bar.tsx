"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const MESSAGES = [
    { text: "Exclusive Wholesale Pricing Available for Approved Vendors", type: "default" },
    { text: "Free Shipping on Orders Over $500", type: "promo" },
    { text: "New Autumn Collection Now Available", type: "new" },
    { text: "Limited Time: 15% Off Bulk Orders - Ends in", type: "countdown", endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) }, // 2 days from now
]

export function AnnouncementBar() {
    const [isVisible, setIsVisible] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [countdown, setCountdown] = useState("")

    useEffect(() => {
        // Check localStorage for dismissal
        const dismissed = localStorage.getItem("announcement-dismissed")
        if (dismissed === "true") {
            setIsVisible(false)
        }
    }, [])

    useEffect(() => {
        // Rotate messages every 5 seconds
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % MESSAGES.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        // Update countdown timer
        const updateCountdown = () => {
            const message = MESSAGES[currentIndex]
            if (message.type === "countdown" && message.endDate) {
                const now = new Date().getTime()
                const distance = message.endDate.getTime() - now

                const days = Math.floor(distance / (1000 * 60 * 60 * 24))
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((distance % (1000 * 60)) / 1000)

                setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)
            }
        }

        updateCountdown()
        const timer = setInterval(updateCountdown, 1000)
        return () => clearInterval(timer)
    }, [currentIndex])

    const handleClose = () => {
        setIsVisible(false)
        localStorage.setItem("announcement-dismissed", "true")
    }

    if (!isVisible) return null

    const currentMessage = MESSAGES[currentIndex]

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-50 bg-secondary px-4 py-2.5 text-center text-xs font-medium uppercase tracking-widest text-secondary-foreground overflow-hidden"
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

            <div className="relative flex items-center justify-center gap-2">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2"
                    >
                        {currentMessage.text}
                        {currentMessage.type === "countdown" && (
                            <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {countdown}
                            </span>
                        )}
                    </motion.p>
                </AnimatePresence>

                <button
                    onClick={handleClose}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-black/10 rounded-full p-1 transition-colors"
                    aria-label="Close announcement"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>

            {/* Progress indicator dots */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1 pb-0.5">
                {MESSAGES.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-0.5 w-4 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-primary" : "bg-black/20"
                            }`}
                    />
                ))}
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
            `}</style>
        </motion.div>
    )
}
