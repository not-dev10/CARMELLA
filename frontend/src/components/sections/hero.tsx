"use client"

import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Image from "@/components/ui/image-shim"
import { Award, Users, ShieldCheck } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

interface HeroContent {
  title: string
  subtitle: string
  desktopImage: string
  mobileImage: string
}

const DEFAULT_HERO: HeroContent = {
  title: "Artistry in Every Detail",
  subtitle: "Handcrafted ceramics and home essentials for the modern retailer. Elevate your inventory with our curated B2B collections.",
  desktopImage: "https://picsum.photos/seed/ceramic-vase-collection/1920/1080",
  mobileImage: "https://picsum.photos/seed/ceramic-vase-collection/540/720",
}

const TRUST_BADGES = [
    { icon: Users, text: "500+ Retailers", subtext: "Worldwide" },
    { icon: Award, text: "Premium Quality", subtext: "Handcrafted" },
    { icon: ShieldCheck, text: "B2B Certified", subtext: "Trusted Partner" }
]

export function HeroSection() {
    const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO)
    const [loading, setLoading] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    // Fetch hero section from backend
    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/homepage/content/hero`)
                if (response.ok) {
                    const data = await response.json()
                    // The content field contains the hero data
                    if (data.content) {
                        setHeroContent({
                            title: data.content.title || DEFAULT_HERO.title,
                            subtitle: data.content.subtitle || DEFAULT_HERO.subtitle,
                            desktopImage: data.content.desktopImage || DEFAULT_HERO.desktopImage,
                            mobileImage: data.content.mobileImage || DEFAULT_HERO.mobileImage,
                        })
                    }
                }
            } catch (error) {
                console.error("Failed to fetch hero content:", error)
                // Use default content on error
            } finally {
                setLoading(false)
            }
        }

        fetchHeroContent()
    }, [])

    // Handle responsive image switching
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const heroImage = isMobile ? heroContent.mobileImage : heroContent.desktopImage

    return (
        <section
            className="relative h-[85vh] min-h-[550px] w-full overflow-hidden flex items-center justify-center bg-black"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Hero Image Background with Ken Burns Effect */}
            <div className="absolute inset-0 z-0 select-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loading ? 0.5 : 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.05],
                        }}
                        transition={{
                            duration: 10,
                            ease: "linear",
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        className="w-full h-full"
                    >
                        <Image
                            src={heroImage}
                            alt={heroContent.title}
                            fill
                            className="object-cover"
                            priority={true}
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
                </motion.div>
            </div>

            <div className="container relative z-10 px-6 text-center text-white">
                <FadeIn>
                    <span className="mb-6 block text-sm font-bold tracking-[0.2em] uppercase opacity-90">
                        Est. 2024
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-8 drop-shadow-2xl">
                        {heroContent.title}
                    </h1>
                    <p className="mx-auto max-w-lg text-lg md:text-xl opacity-90 mb-10 font-light leading-relaxed drop-shadow-md">
                        {heroContent.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="btn-gradient min-w-[160px] h-14 text-base rounded-full border-0 shadow-lg hover:shadow-xl transition-all">
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

            {/* Image Source Indicator (for debugging) */}
            <div className="absolute top-4 right-4 z-20 text-xs text-white/60 pointer-events-none">
                {isMobile ? "📱 Mobile View" : "🖥️ Desktop View"}
            </div>

        </section>
    )
}
