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
    title: "Spices & Seasonings",
    category: "spices",
  },
  {
    id: 2,
    url: "https://carmella-bucket.s3.amazonaws.com/collection/2-grains.jpeg",
    label: "Bulk Ready",
    title: "Grains & Cereals",
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
        <section className="flex flex-col md:flex-row">
            {/* Panel 1 */}
            {currentImages.length > 0 && (
                <motion.div 
                    className="w-full md:w-1/2 section-gradient-accent p-6 sm:p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center text-center group overflow-hidden relative min-h-[400px]"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${currentImages[0]?.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    animate={{ opacity: isTransitioning ? 0.5 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <FadeIn>
                        <span className="text-xs font-bold tracking-widest uppercase text-white mb-3 sm:mb-4 block">{currentImages[0]?.label}</span>
                        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 md:mb-8 font-medium tracking-tight text-white">{currentImages[0]?.title}</h2>
                        <Button 
                            variant="outline" 
                            className="rounded-full bg-white/10 border-white/30 hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg font-medium text-sm md:text-base text-white"
                        >
                            Shop Now
                        </Button>
                    </FadeIn>
                    <div className="absolute inset-0 border-[1px] border-white/10 m-2 sm:m-3 md:m-4 pointer-events-none" />
                </motion.div>
            )}

            {/* Panel 2 */}
            {currentImages.length > 1 && (
                <motion.div 
                    className="w-full md:w-1/2 p-6 sm:p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center text-center relative overflow-hidden group min-h-[400px]"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${currentImages[1]?.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    animate={{ opacity: isTransitioning ? 0.5 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <FadeIn delay={0.2}>
                        <span className="text-xs font-bold tracking-widest uppercase text-white mb-3 sm:mb-4 block">{currentImages[1]?.label}</span>
                        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 md:mb-8 font-medium tracking-tight text-white">{currentImages[1]?.title}</h2>
                        <Button 
                            variant="secondary" 
                            className="rounded-full bg-white/20 border-white/30 hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg font-medium text-sm md:text-base text-white"
                        >
                            Discover More
                        </Button>
                    </FadeIn>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] pointer-events-none mix-blend-overlay"></div>
                </motion.div>
            )}
        </section>
    )
}
