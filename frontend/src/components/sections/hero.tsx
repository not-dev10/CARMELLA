"use client"

import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Image from "@/components/ui/image-shim"
import { Award, Users, ShieldCheck } from "lucide-react"

const HERO_IMAGES = [
    {
        url: "https://picsum.photos/seed/ceramic-vase-collection/1920/1080",
        alt: "Handcrafted ceramic vase collection"
    },
    {
        url: "https://picsum.photos/seed/artisan-pottery/1920/1080",
        alt: "Artisan pottery workshop"
    },
    {
        url: "https://picsum.photos/seed/modern-tableware/1920/1080",
        alt: "Modern ceramic tableware"
    },
    {
        url: "https://picsum.photos/seed/home-decor/1920/1080",
        alt: "Premium home decor essentials"
    }
]

const TRUST_BADGES = [
    { icon: Users, text: "500+ Retailers", subtext: "Worldwide" },
    { icon: Award, text: "Premium Quality", subtext: "Handcrafted" },
    { icon: ShieldCheck, text: "B2B Certified", subtext: "Trusted Partner" }
]

export function HeroSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        if (isPaused) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [isPaused])

    const handleIndicatorClick = useCallback((idx: number) => {
        setCurrentIndex(idx)
    }, [])

    return (
        <section
            className="relative h-[85vh] min-h-[550px] w-full overflow-hidden flex items-center justify-center bg-black"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Carousel Background with Ken Burns Effect */}
            <div className="absolute inset-0 z-0 select-none">
                {HERO_IMAGES.map((image, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: idx === currentIndex ? 1 : 0,
                        }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <motion.div
                            animate={{
                                scale: idx === currentIndex ? [1, 1.1] : 1,
                            }}
                            transition={{
                                duration: 10,
                                ease: "linear",
                            }}
                            className="w-full h-full"
                        >
                            <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                priority={idx === 0}
                            />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
                    </motion.div>
                ))}
            </div>

            <div className="container relative z-10 px-6 text-center text-white">
                <FadeIn>
                    <span className="mb-6 block text-sm font-bold tracking-[0.2em] uppercase opacity-90">
                        Est. 2024
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-8 drop-shadow-2xl">
                        Artistry in <br className="hidden md:block" /> Every Detail
                    </h1>
                    <p className="mx-auto max-w-lg text-lg md:text-xl opacity-90 mb-10 font-light leading-relaxed drop-shadow-md">
                        Handcrafted ceramics and home essentials for the modern retailer.
                        Elevate your inventory with our curated B2B collections.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[160px] h-14 text-base rounded-full border-0 shadow-lg hover:shadow-xl transition-all">
                            Shop Wholesale
                        </Button>
                        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black min-w-[160px] h-14 text-base rounded-full bg-transparent backdrop-blur-sm">
                            View Lookbook
                        </Button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-8">
                        {TRUST_BADGES.map((badge, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + idx * 0.1 }}
                                className="flex items-center gap-3 backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/20"
                            >
                                <badge.icon className="w-5 h-5 text-secondary" />
                                <div className="text-left">
                                    <p className="text-sm font-semibold leading-none">{badge.text}</p>
                                    <p className="text-xs opacity-70 mt-0.5">{badge.subtext}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </FadeIn>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-8 left-8 z-30 flex gap-3">
                {HERO_IMAGES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleIndicatorClick(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                            ? 'bg-secondary w-8 shadow-lg shadow-secondary/50'
                            : 'bg-white/40 hover:bg-white/70 w-2'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

        </section>
    )
}
