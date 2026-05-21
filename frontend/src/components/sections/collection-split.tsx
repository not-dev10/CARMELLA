import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface CollectionImage {
  url: string
  label: string
  title: string
  category: string
  id: number
}

const COLLECTION_IMAGES: CollectionImage[] = [
  {
    id: 1,
    url: "https://carmella-bucket.s3.amazonaws.com/collection/1-spices.jpeg",
    label: "Premium",
    title: "Party Decor",
    category: "spices",
  },
  {
    id: 2,
    url: "https://carmella-bucket.s3.amazonaws.com/collection/2-grains.jpeg",
    label: "Bulk Ready",
    title: "Skincare and Cosmetics",
    category: "grains",
  },
  {
    id: 3,
    url: "https://carmella-bucket.s3.amazonaws.com/collection/3-produce.jpeg",
    label: "Fresh",
    title: "Organic Produce",
    category: "produce",
  },
  {
    id: 4,
    url: "https://carmella-bucket.s3.amazonaws.com/collection/4-baby-care.jpeg",
    label: "Trusted",
    title: "Baby Care Essentials",
    category: "babycare",
  },
]

export function CollectionSplit() {
    const [currentImages, setCurrentImages] = useState<CollectionImage[]>([])
    const [isTransitioning, setIsTransitioning] = useState(false)

    // Get 2 random images that are different from current ones
    const getRandomImagePair = (exclude?: CollectionImage[]): CollectionImage[] => {
        const available = exclude 
          ? COLLECTION_IMAGES.filter(img => !exclude.some(e => e.id === img.id))
          : COLLECTION_IMAGES
        
        if (available.length < 2) return COLLECTION_IMAGES.slice(0, 2)
        
        const shuffled = [...available].sort(() => 0.5 - Math.random())
        return shuffled.slice(0, 2)
    }

    // Initialize with random images
    useEffect(() => {
        setCurrentImages(getRandomImagePair())
    }, [])

    // Rotate images every 6 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true)
            
            setTimeout(() => {
                setCurrentImages(getRandomImagePair(currentImages))
                setIsTransitioning(false)
            }, 500)
        }, 6000)

        return () => clearInterval(interval)
    }, [currentImages])
    return (
        <section className="flex flex-col md:flex-row gap-0">
            {/* Panel 1 */}
            {currentImages.length > 0 && (
                <motion.div 
                    className="w-full md:w-1/2 p-6 sm:p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center text-center group overflow-hidden relative min-h-[500px]"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.35)), url(${currentImages[0]?.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    animate={{ opacity: isTransitioning ? 0.7 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    <FadeIn>
                        <div className="relative z-10">
                            <span className="text-xs font-bold tracking-widest uppercase text-amber-100 mb-3 sm:mb-4 block drop-shadow-lg">{currentImages[0]?.label}</span>
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 sm:mb-8 md:mb-10 font-bold tracking-tight text-white drop-shadow-lg">{currentImages[0]?.title}</h2>
                            <Button 
                                variant="outline" 
                                className="rounded-full bg-white/15 border-white/60 hover:bg-white hover:text-black transition-all duration-300 hover:shadow-xl font-semibold text-sm md:text-base text-white backdrop-blur-sm"
                            >
                                Shop Now
                            </Button>
                        </div>
                    </FadeIn>
                </motion.div>
            )}

            {/* Panel 2 */}
            {currentImages.length > 1 && (
                <motion.div 
                    className="w-full md:w-1/2 p-6 sm:p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center text-center relative overflow-hidden group min-h-[500px]"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.35)), url(${currentImages[1]?.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    animate={{ opacity: isTransitioning ? 0.7 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    <FadeIn delay={0.2}>
                        <div className="relative z-10">
                            <span className="text-xs font-bold tracking-widest uppercase text-rose-100 mb-3 sm:mb-4 block drop-shadow-lg">{currentImages[1]?.label}</span>
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 sm:mb-8 md:mb-10 font-bold tracking-tight text-white drop-shadow-lg">{currentImages[1]?.title}</h2>
                            <Button 
                                variant="secondary" 
                                className="rounded-full bg-white/15 border-white/60 hover:bg-white hover:text-black transition-all duration-300 hover:shadow-xl font-semibold text-sm md:text-base text-white backdrop-blur-sm"
                            >
                                Discover More
                            </Button>
                        </div>
                    </FadeIn>
                </motion.div>
            )}
        </section>
    )
}
