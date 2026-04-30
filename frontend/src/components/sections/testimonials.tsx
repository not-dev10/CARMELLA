import { cn } from "@/lib/utils"
import { Star, BadgeCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Image from "@/components/ui/image-shim"

// Review data with company logos
const reviews = [
    {
        id: 1,
        name: "Elena Rodriguez",
        role: "Interior Designer, Studio Zen",
        quote: "I've been sourcing ceramics for high-end residential projects for over a decade, and Carmella's collection is exceptional.",
        rating: 5,
        verified: true,
        companyLogo: "https://ui-avatars.com/api/?name=Studio+Zen&background=6B7051&color=fff&size=64"
    },
    {
        id: 2,
        name: "Marcus Chen",
        role: "Owner, Bean & Leaf Cafe",
        quote: "We switched to Carmella mugs six months ago and haven't looked back. The aesthetic is Instagram gold.",
        rating: 5,
        verified: true,
        companyLogo: "https://ui-avatars.com/api/?name=Bean+Leaf&background=D4A574&color=fff&size=64"
    },
    {
        id: 3,
        name: "Sarah Jenkins",
        role: "Home Stylist & Content Creator",
        quote: "Incredible craftsmanship that you can actually feel in your hands. The weight distribution is perfect.",
        rating: 5,
        verified: true,
        companyLogo: "https://ui-avatars.com/api/?name=SJ+Studio&background=8B7355&color=fff&size=64"
    },
    {
        id: 4,
        name: "David Miller",
        role: "Principal Architect, Miller & Co",
        quote: "We needed something minimalist yet warm for our new office lounge, and Carmella delivered exactly that.",
        rating: 4,
        verified: true,
        companyLogo: "https://ui-avatars.com/api/?name=Miller+Co&background=6B7051&color=fff&size=64"
    },
    {
        id: 5,
        name: "Priya Patel",
        role: "Ceramics Collector & Curator",
        quote: "The glaze work is absolutely stunning—you can see the mastery in every brush stroke.",
        rating: 5,
        verified: true,
        companyLogo: "https://ui-avatars.com/api/?name=PP+Gallery&background=D4A574&color=fff&size=64"
    },
    {
        id: 6,
        name: "Tom Baker",
        role: "Head Chef, Lumin Restaurant",
        quote: "Plating is half the dining experience, and these dishes elevate everything we serve.",
        rating: 5,
        verified: true,
        companyLogo: "https://ui-avatars.com/api/?name=Lumin+Rest&background=8B7355&color=fff&size=64"
    },
    {
        id: 7,
        name: "Isabella Rossi",
        role: "General Manager, The Meridian Hotel",
        quote: "Our guests rave about the breakfast service every single morning. The tableware adds such a premium feel.",
        rating: 5,
        verified: true,
        companyLogo: "https://ui-avatars.com/api/?name=Meridian+Hotel&background=6B7051&color=fff&size=64"
    },
    {
        id: 8,
        name: "James Wilson",
        role: "Retail Buyer, Artisan Home Co.",
        quote: "Working with Carmella has been a dream. The wholesale process was seamless and professional.",
        rating: 5,
        verified: true,
        companyLogo: "https://ui-avatars.com/api/?name=Artisan+Home&background=D4A574&color=fff&size=64"
    },
    {
        id: 9,
        name: "Sophie Anderson",
        role: "Lifestyle Blogger & Photographer",
        quote: "I'm completely obsessed with the matte finish—it photographs like butter under natural light.",
        rating: 5,
        verified: false,
        companyLogo: "https://ui-avatars.com/api/?name=SA+Photo&background=8B7355&color=fff&size=64"
    },
    {
        id: 10,
        name: "Ryan Park",
        role: "Sustainable Living Advocate",
        quote: "Finally, a brand that walks the talk! Eco-friendly materials and ethical production practices.",
        rating: 5,
        verified: true,
        companyLogo: "https://ui-avatars.com/api/?name=Green+Living&background=6B7051&color=fff&size=64"
    },
]

function ReviewCard({ review, index }: { review: any; index: number }) {
    const [isVisible, setIsVisible] = useState(false)
    const { theme } = useTheme()
    const isDark = theme === "dark"

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <div
            className={cn(
                "relative p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl transition-all duration-500 group overflow-hidden",
                isDark
                    ? "bg-gradient-to-br from-slate-900/80 to-slate-800/60 hover:shadow-[0_0_20px_rgba(139,115,85,0.15)]"
                    : "bg-white hover:shadow-lg",
                isVisible ? "opacity-100" : "opacity-0"
            )}
            style={{
                transitionDelay: `${index * 100}ms`,
            }}
        >
            {/* Top accent line with glow */}
            <div className={cn(
                "absolute top-0 left-0 right-0 h-1 gradient-primary opacity-60 group-hover:opacity-100 transition-all duration-300 rounded-t-lg sm:rounded-t-xl",
                isDark && "group-hover:shadow-[0_0_12px_rgba(139,115,85,0.6)]"
            )} />

            {/* Border glow effect for dark mode */}
            {isDark && (
                <div className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[inset_0_0_20px_rgba(139,115,85,0.1)]" />
            )}

            {/* Company Logo - Responsive size */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                    <Image
                        src={review.companyLogo}
                        alt={review.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <p className={cn("font-serif text-xs sm:text-sm md:text-base font-semibold truncate", isDark ? "text-white" : "text-gray-900")}>
                            {review.name}
                        </p>
                        {review.verified && (
                            <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-current flex-shrink-0" />
                        )}
                    </div>
                    <p className={cn("text-xs sm:text-sm font-light", isDark ? "text-gray-400" : "text-gray-600")}>
                        {review.role}
                    </p>
                </div>
            </div>

            {/* Stars with animation */}
            <div className={cn("flex gap-1.5 mb-5 relative z-10 transition-all duration-700", isVisible ? "opacity-100" : "opacity-0")}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="star-container">
                        <Star
                            className={cn(
                                "w-5 h-5 fill-current transition-all duration-300",
                                i < review.rating
                                    ? isDark
                                        ? "text-secondary animate-star-glow"
                                        : "text-secondary animate-star-bounce"
                                    : isDark
                                        ? "text-gray-600"
                                        : "text-gray-300"
                            )}
                        />
                    </div>
                ))}
            </div>

            {/* Quote */}
            <p
                className={cn(
                    "text-base leading-relaxed mb-6 relative z-10 transition-all duration-700 font-light",
                    isDark ? "text-gray-300" : "text-gray-700",
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                )}
            >
                "{review.quote}"
            </p>


        </div>
    )
}

function ReviewColumn({
    reviews,
    direction = "up",
}: {
    reviews: any[]
    direction?: "up" | "down"
}) {
    const [isHovered, setIsHovered] = useState(false)
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const duplicatedReviews = [...reviews, ...reviews]

    return (
        <div
            className="relative h-[600px] overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={cn(
                    "flex flex-col gap-6 w-full",
                    direction === "up" ? "animate-scroll-up" : "animate-scroll-down",
                    isHovered && "pause-animation"
                )}
            >
                {duplicatedReviews.map((review, i) => (
                    <ReviewCard key={`${review.id}-${i}`} review={review} index={i % reviews.length} />
                ))}
            </div>

            {/* Fade mask - adaptive to theme */}
            <div className={cn(
                "absolute inset-0 pointer-events-none",
                isDark
                    ? "bg-gradient-to-b from-slate-950 via-transparent via-80% to-slate-950"
                    : "bg-gradient-to-b from-white via-transparent via-80% to-white"
            )} />
        </div>
    )
}

export function Testimonials() {
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const column1 = reviews.slice(0, 5)
    const column2 = reviews.slice(5)

    return (
        <section className={cn(
            "relative py-12 sm:py-20 md:py-32 px-3 sm:px-6 overflow-hidden transition-colors duration-500",
            isDark
                ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
                : "bg-gradient-to-b from-white via-white to-yellow-50/30"
        )}>
            {/* Background blobs with parallax */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {isDark ? (
                    <>
                        {/* Dark theme blobs */}
                        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] opacity-40 animate-blob" />
                        <div className="absolute bottom-20 left-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] opacity-40 animate-blob animation-delay-2000" />
                        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-yellow-600/5 rounded-full blur-[100px] opacity-30 animate-blob animation-delay-4000" />
                    </>
                ) : (
                    <>
                        {/* Light theme blobs */}
                        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-yellow-200/15 rounded-full blur-[100px] opacity-40 animate-blob" />
                        <div className="absolute bottom-20 left-10 w-[350px] h-[350px] bg-pink-200/15 rounded-full blur-[100px] opacity-40 animate-blob animation-delay-2000" />
                        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-orange-200/10 rounded-full blur-[100px] opacity-30 animate-blob animation-delay-4000" />
                    </>
                )}

                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.01] mix-blend-overlay" style={{
                    backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 /%3E%3C/filter%3E%3Crect width=%22400%22 height=%22400%22 filter=%22url(%23noise)%22 /%3E%3C/svg%3E')",
                }} />
            </div>

            <div className="container mx-auto px-3 sm:px-6 max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-24">
                    <span className={cn(
                        "mb-3 sm:mb-4 block text-xs sm:text-sm font-bold tracking-[0.2em] uppercase opacity-70",
                        isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                        Customer Stories
                    </span>
                    <h2 className={cn(
                        "font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 font-medium tracking-tight",
                        isDark ? "text-white" : "text-gray-900"
                    )}>
                        Loved by Our Users
                    </h2>

                    {/* Rating Aggregate */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current",
                                        i < 4 ? "text-secondary" : "text-secondary/50"
                                    )}
                                />
                            ))}
                        </div>
                        <span className={cn(
                            "text-lg sm:text-xl md:text-2xl font-bold",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            4.9/5
                        </span>
                    </div>
                    <p className={cn(
                        "text-xs sm:text-sm font-medium mb-6 sm:mb-8",
                        isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                        Based on 500+ verified reviews from B2B partners
                    </p>

                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <div className={cn(
                            "h-1 sm:h-1.5 w-20 sm:w-24 gradient-primary rounded-full blur-sm",
                            isDark ? "shadow-[0_0_12px_rgba(139,115,85,0.4)]" : "shadow-[0_0_12px_rgba(139,115,85,0.5)]"
                        )} />
                        <p className={cn(
                            "text-sm sm:text-lg md:text-xl font-light leading-relaxed",
                            isDark ? "text-gray-300" : "text-gray-600"
                        )}>
                            Real feedback from real customers
                        </p>
                    </div>
                </div>

                {/* Reviews Grid - Responsive columns */}
                <div className="hidden md:grid grid-cols-2 gap-8">
                    <ReviewColumn reviews={column1} direction="up" />
                    <ReviewColumn reviews={column2} direction="down" />
                </div>

                {/* Mobile - Single column scroll */}
                <div className="md:hidden">
                    <ReviewColumn reviews={reviews} direction="up" />
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes scroll-up {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(-50%);
                    }
                }

                @keyframes scroll-down {
                    0% {
                        transform: translateY(-50%);
                    }
                    100% {
                        transform: translateY(0);
                    }
                }

                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }

                @keyframes star-bounce {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-4px) scale(1.1);
                    }
                }

                @keyframes star-glow {
                    0%, 100% {
                        filter: drop-shadow(0 0 0px rgba(250, 204, 21, 0));
                        transform: scale(1);
                    }
                    50% {
                        filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.8));
                        transform: scale(1.15);
                    }
                }

                .animate-scroll-up {
                    animation: scroll-up 30s linear infinite;
                }

                .animate-scroll-down {
                    animation: scroll-down 30s linear infinite;
                }

                .pause-animation {
                    animation-play-state: paused;
                }

                .animate-blob {
                    animation: blob 7s infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }

                .star-container:nth-child(1) .animate-star-bounce {
                    animation: star-bounce 0.6s ease-in-out;
                }

                .star-container:nth-child(2) .animate-star-bounce {
                    animation: star-bounce 0.6s ease-in-out 0.1s;
                }

                .star-container:nth-child(3) .animate-star-bounce {
                    animation: star-bounce 0.6s ease-in-out 0.2s;
                }

                .star-container:nth-child(4) .animate-star-bounce {
                    animation: star-bounce 0.6s ease-in-out 0.3s;
                }

                .star-container:nth-child(5) .animate-star-bounce {
                    animation: star-bounce 0.6s ease-in-out 0.4s;
                }

                .star-container:nth-child(1) .animate-star-glow {
                    animation: star-glow 2s ease-in-out infinite;
                }

                .star-container:nth-child(2) .animate-star-glow {
                    animation: star-glow 2s ease-in-out 0.2s infinite;
                }

                .star-container:nth-child(3) .animate-star-glow {
                    animation: star-glow 2s ease-in-out 0.4s infinite;
                }

                .star-container:nth-child(4) .animate-star-glow {
                    animation: star-glow 2s ease-in-out 0.6s infinite;
                }

                .star-container:nth-child(5) .animate-star-glow {
                    animation: star-glow 2s ease-in-out 0.8s infinite;
                }
            `}</style>
        </section>
    )
}
