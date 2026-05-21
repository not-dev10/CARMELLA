"use client"

import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "@/components/ui/image-shim"
import { Award, Users, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

interface HeroImage {
  desktopImage: string
  mobileImage: string
}

interface HeroContent {
  badge: string
  title: string
  subtitle: string
  cta1Text: string
  cta1Link?: string
  cta2Text: string
  cta2Link?: string
  badge1Text: string
  badge1Subtext: string
  badge2Text: string
  badge2Subtext: string
  badge3Text: string
  badge3Subtext: string
  images: HeroImage[]
}

const DEFAULT_HERO: HeroContent = {
  badge: "EST. 2024",
  title: "Get the best FMCG deals with Carmella—reliable supply, better margins, and faster delivery.",
  subtitle: "Authentic flavors and quality essentials for every home. Discover our curated B2B collections of premium Indian products.",
  cta1Text: "Shop Wholesale",
  cta1Link: "/shop",
  cta2Text: "View Lookbook",
  cta2Link: "/lookbook",
  badge1Text: "500+ Retailers",
  badge1Subtext: "Worldwide",
  badge2Text: "Premium Quality",
  badge2Subtext: "Authentic",
  badge3Text: "B2B Ready",
  badge3Subtext: "Fast Delivery",
  images: [
    {
      desktopImage: "https://carmella-bucket.s3.amazonaws.com/hero/desktop/hero-products.jpeg",
      mobileImage: "/hero-mobile.png",
    }
  ],
}

const TRUST_BADGE_ICONS = [
  { icon: Users },
  { icon: Award },
  { icon: ShieldCheck },
]

export function HeroSection() {
    const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO)
    const [loading, setLoading] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [autoplay, setAutoplay] = useState(true)

    // Fetch hero section from backend
    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                console.log(`[HERO] Fetching hero content from ${API_BASE_URL}/homepage/content/hero`)
                const response = await fetch(`${API_BASE_URL}/homepage/content/hero`)
                
                if (!response.ok) {
                    console.error(`[HERO] Failed to fetch - Status: ${response.status}`)
                    setLoading(false)
                    return
                }
                
                const data = await response.json()
                console.log(`[HERO] Fetched data:`, data)
                
                // The content field contains the hero data
                if (data.content) {
                    const newHeroContent = {
                        badge: data.content.badge || DEFAULT_HERO.badge,
                        title: DEFAULT_HERO.title,
                        subtitle: data.content.subtitle || DEFAULT_HERO.subtitle,
                        cta1Text: data.content.cta1Text || DEFAULT_HERO.cta1Text,
                        cta1Link: data.content.cta1Link || DEFAULT_HERO.cta1Link,
                        cta2Text: data.content.cta2Text || DEFAULT_HERO.cta2Text,
                        cta2Link: data.content.cta2Link || DEFAULT_HERO.cta2Link,
                        badge1Text: data.content.badge1Text || DEFAULT_HERO.badge1Text,
                        badge1Subtext: data.content.badge1Subtext || DEFAULT_HERO.badge1Subtext,
                        badge2Text: data.content.badge2Text || DEFAULT_HERO.badge2Text,
                        badge2Subtext: data.content.badge2Subtext || DEFAULT_HERO.badge2Subtext,
                        badge3Text: data.content.badge3Text || DEFAULT_HERO.badge3Text,
                        badge3Subtext: data.content.badge3Subtext || DEFAULT_HERO.badge3Subtext,
                        images: (data.content.images && data.content.images.length > 0) 
                          ? data.content.images 
                          : DEFAULT_HERO.images,
                    }
                    console.log(`[HERO] Setting new hero content:`, newHeroContent)
                    setHeroContent(newHeroContent)
                } else {
                    console.log(`[HERO] No content found in response, using defaults`)
                }
            } catch (error) {
                console.error("[HERO] Failed to fetch hero content:", error)
                // Use default content on error
            } finally {
                setLoading(false)
            }
        }

        fetchHeroContent()
        
        // Set up interval to refetch hero content every 30 seconds
        const interval = setInterval(() => {
            console.log(`[HERO] Auto-refreshing hero content`)
            fetchHeroContent()
        }, 30000)
        
        return () => clearInterval(interval)
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

    // Autoplay carousel
    useEffect(() => {
        if (!autoplay || heroContent.images.length <= 1) return

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroContent.images.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [autoplay, heroContent.images.length])

    const currentImage = heroContent.images[currentImageIndex]
    const heroImage = isMobile ? currentImage.mobileImage : currentImage.desktopImage

    // Trust badges configuration from hero content
    const TRUST_BADGES = [
        { icon: TRUST_BADGE_ICONS[0].icon, text: heroContent.badge1Text, subtext: heroContent.badge1Subtext },
        { icon: TRUST_BADGE_ICONS[1].icon, text: heroContent.badge2Text, subtext: heroContent.badge2Subtext },
        { icon: TRUST_BADGE_ICONS[2].icon, text: heroContent.badge3Text, subtext: heroContent.badge3Subtext },
    ]

    const goToPrevious = () => {
        setAutoplay(false)
        setCurrentImageIndex((prev) => (prev - 1 + heroContent.images.length) % heroContent.images.length)
    }

    const goToNext = () => {
        setAutoplay(false)
        setCurrentImageIndex((prev) => (prev + 1) % heroContent.images.length)
    }

    const goToImage = (index: number) => {
        setAutoplay(false)
        setCurrentImageIndex(index)
    }

    return (
        <section
            className="relative h-screen min-h-[550px] sm:min-h-[650px] md:min-h-[85vh] w-full overflow-hidden flex items-center justify-center bg-black"
        >
            {/* Hero Image Carousel */}
            <div className="absolute inset-0 z-0 select-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: loading ? 0.5 : 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <motion.div
                            animate={isMobile ? {} : {
                                scale: [1, 1.05],
                            }}
                            transition={isMobile ? {} : {
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
                                className={isMobile ? "object-contain" : "object-cover"}
                                priority={true}
                            />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/30" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="container relative z-10 px-4 sm:px-6 text-center text-white">
                <FadeIn>
                    <span className="mb-4 sm:mb-6 block text-xs sm:text-sm font-bold tracking-[0.2em] uppercase opacity-90">
                        {heroContent.badge}
                    </span>
                    <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight mb-8 sm:mb-10 md:mb-12 drop-shadow-2xl px-2">
                        Get the best FMCG deals with Carmella—reliable supply, better margins, and faster delivery.
                    </h1>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        <Button size="lg" className="btn-gradient min-w-[140px] sm:min-w-[160px] h-11 sm:h-14 text-xs sm:text-base rounded-full border-0 shadow-lg hover:shadow-xl transition-all">
                            {heroContent.cta1Text}
                        </Button>
                    </div>

                    {/* Trust Badges - Responsive */}
                    <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                        {TRUST_BADGES.map((badge, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + idx * 0.1 }}
                                className="flex items-center gap-2 sm:gap-3 backdrop-blur-md bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20"
                            >
                                <badge.icon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs sm:text-sm font-semibold leading-none">{badge.text}</p>
                                    <p className="text-xs opacity-70 mt-0.5">{badge.subtext}</p>
                                </div>
                                <div className="text-left sm:hidden">
                                    <p className="text-xs font-semibold leading-none">{badge.text.split(',')[0]}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </FadeIn>
            </div>

            {/* Carousel Controls - Only show if multiple images */}
            {heroContent.images.length > 1 && (
                <>
                    {/* Previous Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToPrevious}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 sm:p-3 rounded-full transition-colors"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.button>

                    {/* Next Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToNext}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 sm:p-3 rounded-full transition-colors"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-full">
                        {heroContent.images.map((_, index) => (
                            <motion.button
                                key={index}
                                onClick={() => goToImage(index)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className={`rounded-full transition-all ${
                                    index === currentImageIndex
                                        ? "bg-white w-6 sm:w-8 h-2"
                                        : "bg-white/40 w-1.5 sm:w-2 h-2 hover:bg-white/70"
                                }`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Image Source Indicator (for debugging) */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 text-xs text-white/60 pointer-events-none">
                {isMobile ? "📱 Mobile View" : "🖥️ Desktop View"} - Image {currentImageIndex + 1}/{heroContent.images.length}
            </div>

        </section>
    )

}
