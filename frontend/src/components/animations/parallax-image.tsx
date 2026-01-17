"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "@/components/ui/image-shim"
import { cn } from "@/lib/utils"

interface ParallaxImageProps {
    src: string
    alt: string
    className?: string
    aspectRatio?: string
    priority?: boolean
}

export function ParallaxImage({
    src,
    alt,
    className,
    aspectRatio = "aspect-[16/9]",
    priority = false
}: ParallaxImageProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    // Parallax effect: image moves slightly slower than scroll
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05])

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden w-full", aspectRatio, className)}
        >
            <motion.div
                style={{ y, scale }}
                className="absolute inset-[-10%] h-[120%] w-full"
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    className="object-cover"
                />
            </motion.div>
        </div>
    )
}
