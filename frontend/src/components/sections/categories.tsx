"use client"

import { motion } from "framer-motion"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import { FadeIn } from "@/components/animations/fade-in"
import Link from "@/components/ui/link-shim"
import { ArrowRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { homepageAPI } from "@/lib/api"

interface Category {
    id: string
    name: string
    slug: string
    description?: string
    image_url?: string
    created_at: string
}

const ACCENT_COLORS = [
    "107, 112, 81",
    "212, 165, 116",
    "139, 115, 85",
    "168, 137, 104",
]

// 3D Category Card Component
function Category3DCard({ category, index }: { category: Category; index: number }) {
    const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length]
    const defaultImage = `https://images.unsplash.com/photo-1578500494198-246f612d03b3?auto=format&fit=crop&q=80&w=600`
    const [borderColor, setBorderColor] = useState(`rgba(${accentColor}, 0.5)`)

    const GRADIENT_COLORS = [
        'rgba(255, 107, 107, 1)',
        'rgba(107, 194, 255, 1)',
        'rgba(107, 255, 194, 1)',
        'rgba(255, 194, 107, 1)',
        'rgba(194, 107, 255, 1)',
        'rgba(255, 107, 194, 1)',
        'rgba(107, 255, 107, 1)',
        'rgba(255, 255, 107, 1)',
    ]

    const generateRandomColor = () => {
        return GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)]
    }

    const handleHover = () => {
        setBorderColor(generateRandomColor())
    }

    return (
        <FadeIn delay={index * 0.05}>
            <CardContainer className="inter-var w-full h-full" onMouseEnter={handleHover}>
                <CardBody className="relative group/card w-[550px] h-[550px] rounded-2xl p-0 border-0 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500" style={{
                    boxShadow: `inset 0 0 0 3px ${borderColor}, 0 0 30px ${borderColor}, 0 0 60px ${borderColor}cc, 0 10px 30px rgba(0,0,0,0.2)`,
                    transition: 'box-shadow 0.3s ease'
                }}>
                    {/* Dramatic shadow with accent color on hover */}
                    <div
                        className="absolute -inset-1 rounded-2xl opacity-0 group-hover/card:opacity-100 blur-xl transition-opacity duration-500 -z-10"
                        style={{
                            background: `radial-gradient(circle, rgba(${accentColor}, 0.4) 0%, rgba(${accentColor}, 0.1) 50%, transparent 100%)`
                        }}
                    />

                    {/* Background with gradient overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={category.image_url || defaultImage}
                            alt={category.name}
                            className="w-full h-full object-cover"
                        />
                        {/* Matte frosted overlay - lighter to show image better */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60 group-hover/card:from-black/0 group-hover/card:via-black/0 group-hover/card:to-black/0 transition-all duration-500" />

                        {/* Subtle noise texture for matte effect */}
                        <div
                            className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                            }}
                        />

                        {/* Accent color glow */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                            style={{
                                background: `radial-gradient(circle at 50% 0%, rgba(${accentColor}, 0.25) 0%, transparent 60%)`
                            }}
                        />
                    </div>

                    {/* Content with enhanced matte glassmorphism */}
                    <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                        {/* Title */}
                        <CardItem
                            translateZ="60"
                            className="text-3xl font-sans font-extrabold text-white text-center w-full drop-shadow-lg"
                            style={{
                                textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.6)',
                                letterSpacing: '0px'
                            }}
                        >
                            {category.name}
                        </CardItem>

                        {/* Subtitle */}
                        <CardItem
                            as="p"
                            translateZ="70"
                            className="text-white/90 text-sm w-full text-center drop-shadow-md line-clamp-2 font-medium"
                            style={{
                                textShadow: '0 1px 6px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)',
                                letterSpacing: '0px'
                            }}
                        >
                            {category.description || "Explore this collection"}
                        </CardItem>

                        {/* Glassmorphism card at bottom */}
                        <CardItem translateZ="80" className="w-full">
                            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:bg-white/20 transition-colors">
                                <Link
                                    href={`/category/${category.slug}`}
                                    className="w-full px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 text-white"
                                    style={{
                                        background: `rgba(${accentColor}, 0.85)`,
                                        boxShadow: `0 4px 12px rgba(${accentColor}, 0.4)`,
                                        letterSpacing: '0px'
                                    }}
                                >
                                    SHOP NOW
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </CardItem>
                    </div>

                    {/* Subtle border glow on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                            boxShadow: `inset 0 0 0 1px rgba(${accentColor}, 0.4), 0 0 20px rgba(${accentColor}, 0.2)`
                        }}
                    />
                </CardBody>
            </CardContainer>
        </FadeIn>
    )
}

// Main Categories Section with 3D Cards
export function CategoriesSection() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const hasFetched = useRef(false)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await homepageAPI.getCategories()
                setCategories(data.categories || [])
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            } finally {
                setLoading(false)
            }
        }

        // Only fetch once
        if (!hasFetched.current) {
            hasFetched.current = true
            fetchCategories()
        }
    }, [])

    if (loading) {
        return (
            <section className="py-24 px-6 bg-background">
                <div className="container mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square bg-muted rounded-2xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-24 px-6 bg-background relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <FadeIn>
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 block">
                            Explore Our Collections
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
                            Shop by Category
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Discover our curated selection of handcrafted ceramics and home essentials
                        </p>
                    </div>
                </FadeIn>

                {/* Desktop Grid - Hidden on Mobile */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto">
                    {categories.map((category, index) => (
                        <Category3DCard key={category.id} category={category} index={index} />
                    ))}
                </div>

                {/* Mobile Horizontal Slider - Hidden on Desktop */}
                <div className="sm:hidden -mx-6 relative">
                    {/* Scroll Indicator - Shows on first load */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-8 z-20 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 1, x: 0 }}
                            animate={{
                                opacity: [1, 0.5, 1],
                                x: [-10, 0, -10]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/20">
                                <svg
                                    className="w-6 h-6 text-primary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-white bg-primary/90 px-3 py-1 rounded-full shadow-lg">
                                Swipe
                            </span>
                        </motion.div>
                    </div>

                    {/* Scrollable Container */}
                    <div className="flex gap-4 px-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
                        {categories.map((category, index) => (
                            <div key={category.id} className="snap-center flex-shrink-0 w-[85vw] max-w-[340px]">
                                <Category3DCard category={category} index={index} />
                            </div>
                        ))}
                    </div>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mt-4 pb-2">
                        {Array.from({ length: Math.ceil(categories.length / 3) }).map((_, idx) => (
                            <div
                                key={idx}
                                className="w-2 h-2 rounded-full bg-muted-foreground/30"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                @keyframes gradientShift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
            `}</style>
        </section>
    )
}
