"use client"

import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface ParallaxProps {
    children: ReactNode
    className?: string
    offset?: number
}

export function Parallax({
    children,
    className = "",
    offset = 30
}: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], [-offset, offset])

    return (
        <div ref={ref} className={className}>
            <motion.div style={{ y, willChange: "transform" }}>
                {children}
            </motion.div>
        </div>
    )
}

interface ParallaxImageProps {
    src: string
    alt: string
    fill?: boolean
    width?: number
    height?: number
    className?: string
    containerClassName?: string
    scale?: number
}

export function ParallaxImage({
    src,
    alt,
    fill,
    width,
    height,
    className,
    containerClassName,
    scale = 1.1
}: ParallaxImageProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    const scaleAnim = useTransform(scrollYProgress, [0, 1], [1, scale])
    const yAnim = useTransform(scrollYProgress, [0, 1], ["0%", "15%"])

    return (
        <div ref={ref} className={`overflow-hidden relative ${containerClassName}`}>
            <motion.div 
                style={{ y: yAnim, scale: scaleAnim, willChange: "transform" }} 
                className="w-full h-full relative"
            >
                <img
                    src={src}
                    alt={alt}
                    width={fill ? undefined : width}
                    height={fill ? undefined : height}
                    className={`object-cover ${fill ? "absolute inset-0 w-full h-full" : ""} ${className}`}
                    loading="lazy"
                />
            </motion.div>
        </div>
    )
}
