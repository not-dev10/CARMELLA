"use client"

import { motion } from "framer-motion"
import { FadeIn } from "@/components/animations/fade-in"
import Link from "@/components/ui/link-shim"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { homepageAPI } from "@/lib/api"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface Category {
    id: string
    name: string
    slug: string
    description?: string
    image_url?: string
    created_at: string
}

// Compact Category Card Component
function CategoryCard({ category, index }: { category: Category; index: number }) {
    const [isHovered, setIsHovered] = useState(false)
    const defaultImage = `https://images.unsplash.com/photo-1578500494198-246f612d03b3?auto=format&fit=crop&q=80&w=400`

    return (
        <FadeIn delay={index * 0.05}>
            <Link href={`/category/${category.slug}`}>
                <motion.div
                    className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <OptimizedImage
                            src={category.image_url || defaultImage}
                            alt={category.name}
                            preset="categoryCard"
                            className="w-full h-full"
                        />
                        
                        {/* Overlay on hover */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Floating badge */}
                        <motion.div
                            className="absolute top-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                        >
                            <ShoppingBag className="w-4 h-4 text-primary" />
                        </motion.div>

                        {/* Shop Now button - appears on hover */}
                        <motion.div
                            className="absolute inset-x-0 bottom-0 p-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-primary font-semibold py-2.5 px-4 rounded-xl shadow-lg">
                                <span className="text-sm">Shop Now</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                            {category.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {category.description || "Explore our collection"}
                        </p>
                    </div>

                    {/* Animated border */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-primary"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.95 }}
                        transition={{ duration: 0.3 }}
                    />
                </motion.div>
            </Link>
        </FadeIn>
    )
}

// Main Categories Section
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

        if (!hasFetched.current) {
            hasFetched.current = true
            fetchCategories()
        }
    }, [])

    if (loading) {
        return (
            <section className="py-16 px-6 bg-gray-50 dark:bg-gray-950">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-3" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-16 px-6 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Section Header */}
                <FadeIn>
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="inline-block mb-4"
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-sm font-semibold">
                                <ShoppingBag className="w-4 h-4" />
                                Shop by Category
                            </span>
                        </motion.div>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                            Browse Our Collections
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Discover quality products across all categories
                        </p>
                    </div>
                </FadeIn>

                {/* Categories Grid - Responsive */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {categories.map((category, index) => (
                        <CategoryCard key={category.id} category={category} index={index} />
                    ))}
                </div>

                {/* View All Button */}
                {categories.length > 0 && (
                    <FadeIn delay={0.4}>
                        <div className="text-center mt-12">
                            <Link href="/catalog">
                                <motion.button
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    View All Products
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                        </div>
                    </FadeIn>
                )}
            </div>
        </section>
    )
}
