"use client"

import { motion } from "framer-motion"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import { FadeIn } from "@/components/animations/fade-in"
import Link from "@/components/ui/link-shim"
import { ArrowRight } from "lucide-react"

// Category type definition
interface Category {
    id: string
    title: string
    subtitle: string
    icon: string
    image: string
    accentColor: string
    href: string
}

// Categories data - Expanded to 24 categories
const categories: Category[] = [
    {
        id: "tableware",
        title: "Tableware",
        subtitle: "Plates, Bowls & Serving",
        icon: "🍽️",
        image: "https://picsum.photos/seed/tableware/600/400",
        accentColor: "107, 112, 81",
        href: "/catalog?category=tableware"
    },
    {
        id: "decor",
        title: "Home Decor",
        subtitle: "Vases & Decorative Objects",
        icon: "🏺",
        image: "https://picsum.photos/seed/decor/600/400",
        accentColor: "212, 165, 116",
        href: "/catalog?category=decor"
    },
    {
        id: "textiles",
        title: "Textiles",
        subtitle: "Linens & Soft Furnishings",
        icon: "🧵",
        image: "https://picsum.photos/seed/textiles/600/400",
        accentColor: "139, 115, 85",
        href: "/catalog?category=textiles"
    },
    {
        id: "lighting",
        title: "Lighting",
        subtitle: "Lamps & Candle Holders",
        icon: "💡",
        image: "https://picsum.photos/seed/lighting/600/400",
        accentColor: "168, 137, 104",
        href: "/catalog?category=lighting"
    },
    {
        id: "kitchen",
        title: "Kitchen",
        subtitle: "Cookware & Utensils",
        icon: "🍳",
        image: "https://picsum.photos/seed/kitchen/600/400",
        accentColor: "107, 112, 81",
        href: "/catalog?category=kitchen"
    },
    {
        id: "outdoor",
        title: "Outdoor",
        subtitle: "Garden & Patio",
        icon: "🌿",
        image: "https://picsum.photos/seed/outdoor/600/400",
        accentColor: "212, 165, 116",
        href: "/catalog?category=outdoor"
    },
    {
        id: "bath",
        title: "Bath & Body",
        subtitle: "Spa & Wellness",
        icon: "🛁",
        image: "https://picsum.photos/seed/bath/600/400",
        accentColor: "139, 115, 85",
        href: "/catalog?category=bath"
    },
    {
        id: "gifts",
        title: "Gift Sets",
        subtitle: "Curated Collections",
        icon: "🎁",
        image: "https://picsum.photos/seed/gifts/600/400",
        accentColor: "168, 137, 104",
        href: "/catalog?category=gifts"
    },
    {
        id: "storage",
        title: "Storage",
        subtitle: "Baskets & Organizers",
        icon: "🧺",
        image: "https://picsum.photos/seed/storage/600/400",
        accentColor: "107, 112, 81",
        href: "/catalog?category=storage"
    },
    {
        id: "furniture",
        title: "Furniture",
        subtitle: "Tables & Seating",
        icon: "🪑",
        image: "https://picsum.photos/seed/furniture/600/400",
        accentColor: "212, 165, 116",
        href: "/catalog?category=furniture"
    },
    {
        id: "art",
        title: "Wall Art",
        subtitle: "Prints & Sculptures",
        icon: "🖼️",
        image: "https://picsum.photos/seed/art/600/400",
        accentColor: "139, 115, 85",
        href: "/catalog?category=art"
    },
    {
        id: "planters",
        title: "Planters",
        subtitle: "Indoor & Outdoor Pots",
        icon: "🪴",
        image: "https://picsum.photos/seed/planters/600/400",
        accentColor: "168, 137, 104",
        href: "/catalog?category=planters"
    },
    {
        id: "mirrors",
        title: "Mirrors",
        subtitle: "Decorative & Functional",
        icon: "🪞",
        image: "https://picsum.photos/seed/mirrors/600/400",
        accentColor: "107, 112, 81",
        href: "/catalog?category=mirrors"
    },
    {
        id: "cushions",
        title: "Cushions",
        subtitle: "Pillows & Throws",
        icon: "🛋️",
        image: "https://picsum.photos/seed/cushions/600/400",
        accentColor: "212, 165, 116",
        href: "/catalog?category=cushions"
    },
    {
        id: "rugs",
        title: "Rugs",
        subtitle: "Area & Accent Rugs",
        icon: "🧶",
        image: "https://picsum.photos/seed/rugs/600/400",
        accentColor: "139, 115, 85",
        href: "/catalog?category=rugs"
    },
    {
        id: "clocks",
        title: "Clocks",
        subtitle: "Wall & Table Clocks",
        icon: "🕰️",
        image: "https://picsum.photos/seed/clocks/600/400",
        accentColor: "168, 137, 104",
        href: "/catalog?category=clocks"
    },
    {
        id: "bedding",
        title: "Bedding",
        subtitle: "Sheets & Duvet Covers",
        icon: "🛏️",
        image: "https://picsum.photos/seed/bedding/600/400",
        accentColor: "107, 112, 81",
        href: "/catalog?category=bedding"
    },
    {
        id: "office",
        title: "Office",
        subtitle: "Desk Accessories",
        icon: "📎",
        image: "https://picsum.photos/seed/office/600/400",
        accentColor: "212, 165, 116",
        href: "/catalog?category=office"
    },
    {
        id: "books",
        title: "Books & Magazines",
        subtitle: "Design & Lifestyle",
        icon: "📚",
        image: "https://picsum.photos/seed/books/600/400",
        accentColor: "139, 115, 85",
        href: "/catalog?category=books"
    },
    {
        id: "fragrances",
        title: "Fragrances",
        subtitle: "Candles & Diffusers",
        icon: "🕯️",
        image: "https://picsum.photos/seed/fragrances/600/400",
        accentColor: "168, 137, 104",
        href: "/catalog?category=fragrances"
    },
    {
        id: "glassware",
        title: "Glassware",
        subtitle: "Glasses & Decanters",
        icon: "🥃",
        image: "https://picsum.photos/seed/glassware/600/400",
        accentColor: "107, 112, 81",
        href: "/catalog?category=glassware"
    },
    {
        id: "cutlery",
        title: "Cutlery",
        subtitle: "Flatware & Serving",
        icon: "🍴",
        image: "https://picsum.photos/seed/cutlery/600/400",
        accentColor: "212, 165, 116",
        href: "/catalog?category=cutlery"
    },
    {
        id: "seasonal",
        title: "Seasonal",
        subtitle: "Holiday & Festive",
        icon: "🎄",
        image: "https://picsum.photos/seed/seasonal/600/400",
        accentColor: "139, 115, 85",
        href: "/catalog?category=seasonal"
    },
    {
        id: "kids",
        title: "Kids & Nursery",
        subtitle: "Children's Decor",
        icon: "🧸",
        image: "https://picsum.photos/seed/kids/600/400",
        accentColor: "168, 137, 104",
        href: "/catalog?category=kids"
    }
]

// 3D Category Card Component
function Category3DCard({ category, index }: { category: Category; index: number }) {
    return (
        <FadeIn delay={index * 0.05}>
            <CardContainer className="inter-var">
                <CardBody className="relative group/card w-full h-auto rounded-2xl p-0 border-0 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    {/* Dramatic shadow with accent color on hover */}
                    <div
                        className="absolute -inset-1 rounded-2xl opacity-0 group-hover/card:opacity-100 blur-xl transition-opacity duration-500 -z-10"
                        style={{
                            background: `radial-gradient(circle, rgba(${category.accentColor}, 0.4) 0%, rgba(${category.accentColor}, 0.1) 50%, transparent 100%)`
                        }}
                    />

                    {/* Background with gradient overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={category.image}
                            alt={category.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Matte frosted overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/85 backdrop-blur-[2px] group-hover/card:from-black/40 group-hover/card:via-black/60 group-hover/card:to-black/75 transition-all duration-500" />

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
                                background: `radial-gradient(circle at 50% 0%, rgba(${category.accentColor}, 0.25) 0%, transparent 60%)`
                            }}
                        />
                    </div>

                    {/* Content with enhanced matte glassmorphism */}
                    <div className="relative z-10 p-6 flex flex-col h-full min-h-[380px]">
                        {/* Icon with matte glass container */}
                        <CardItem
                            translateZ="50"
                            className="text-5xl mb-4 text-center w-full drop-shadow-lg"
                        >
                            <div className="inline-block p-3 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/20 shadow-lg">
                                {category.icon}
                            </div>
                        </CardItem>

                        {/* Title */}
                        <CardItem
                            translateZ="60"
                            className="text-2xl font-serif font-bold text-white text-center w-full mb-2 drop-shadow-md"
                        >
                            {category.title}
                        </CardItem>

                        {/* Subtitle */}
                        <CardItem
                            as="p"
                            translateZ="70"
                            className="text-white/90 text-sm w-full text-center mb-6 drop-shadow-sm"
                        >
                            {category.subtitle}
                        </CardItem>

                        {/* Spacer to push buttons to bottom */}
                        <div className="flex-1" />

                        {/* Glassmorphism card at bottom */}
                        <CardItem translateZ="80" className="w-full">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="flex justify-between items-center gap-3">
                                    <Link
                                        href={category.href}
                                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/20"
                                    >
                                        Explore
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={category.href}
                                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center"
                                        style={{
                                            background: `rgba(${category.accentColor}, 0.9)`,
                                            color: '#FDFCF6',
                                            boxShadow: `0 4px 12px rgba(${category.accentColor}, 0.3)`
                                        }}
                                    >
                                        Shop Now
                                    </Link>
                                </div>
                            </div>
                        </CardItem>
                    </div>

                    {/* Subtle border glow on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                            boxShadow: `inset 0 0 0 1px rgba(${category.accentColor}, 0.4), 0 0 20px rgba(${category.accentColor}, 0.2)`
                        }}
                    />
                </CardBody>
            </CardContainer>
        </FadeIn>
    )
}

// Main Categories Section with 3D Cards
export function CategoriesSection() {
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
            `}</style>
        </section>
    )
}
