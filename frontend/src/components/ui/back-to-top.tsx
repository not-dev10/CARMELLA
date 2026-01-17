"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = (scrollTop / docHeight) * 100

            setScrollProgress(progress)
            setIsVisible(scrollTop > 300)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    onClick={scrollToTop}
                    className={cn(
                        "fixed bottom-8 right-8 z-50",
                        "w-14 h-14 rounded-full",
                        "bg-primary text-primary-foreground",
                        "shadow-lg hover:shadow-xl",
                        "flex items-center justify-center",
                        "transition-all duration-300",
                        "hover:scale-110 active:scale-95",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    )}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {/* Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="28"
                            cy="28"
                            r="26"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="opacity-20"
                        />
                        <circle
                            cx="28"
                            cy="28"
                            r="26"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 26}`}
                            strokeDashoffset={`${2 * Math.PI * 26 * (1 - scrollProgress / 100)}`}
                            className="transition-all duration-150"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Arrow Icon */}
                    <ArrowUp className="w-5 h-5 relative z-10" />
                </motion.button>
            )}
        </AnimatePresence>
    )
}
