"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { SplineScene } from "@/components/ui/spline-scene"

export function FeatureShowcase3D() {
    const containerRef = useRef<HTMLDivElement>(null)

    // Track scroll progress relative to this container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    // Text animations based on scroll - optimized ranges
    const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.35], [0, 1, 0])
    const y1 = useTransform(scrollYProgress, [0, 0.15, 0.35], [40, 0, -40])

    const opacity2 = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 1, 0])
    const y2 = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [40, 0, -40])

    const opacity3 = useTransform(scrollYProgress, [0.65, 0.8, 1], [0, 1, 0])
    const y3 = useTransform(scrollYProgress, [0.65, 0.8, 1], [40, 0, -40])

    return (
        <section
            ref={containerRef}
            className="relative h-[300vh] bg-neutral-950"
            aria-label="3D Interaction Showcase"
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Spline Background */}
                <div className="absolute inset-0 z-0">
                    <SplineScene
                        scene="https://my.spline.design/miniroomartcopy-4b82d3b2b7371c265691d57502755222/"
                        className="w-full h-full"
                    />
                </div>

                {/* Overlay Content */}
                <div className="relative z-10 flex h-full w-full items-center justify-center pointer-events-none">

                    {/* Section 1 Text */}
                    <motion.div
                        style={{ opacity: opacity1, y: y1, willChange: "opacity, transform" }}
                        className="absolute text-center max-w-4xl px-6"
                    >
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl font-serif">
                            Immersive <span className="text-primary text-neon">Experiences</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-white/80 font-light">
                            Scroll through the dimensions of modern design.
                        </p>
                    </motion.div>

                    {/* Section 2 Text */}
                    <motion.div
                        style={{ opacity: opacity2, y: y2, willChange: "opacity, transform" }}
                        className="absolute text-center max-w-4xl px-6"
                    >
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl font-serif">
                            Interactive <span className="text-secondary text-neon">Control</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-white/80 font-light">
                            Engage your users with reactive 3D elements.
                        </p>
                    </motion.div>

                    {/* Section 3 Text */}
                    <motion.div
                        style={{ opacity: opacity3, y: y3, willChange: "opacity, transform" }}
                        className="absolute text-center max-w-4xl px-6"
                    >
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl font-serif">
                            Future <span className="text-accent text-neon">Ready</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-white/80 font-light">
                            Built for performance and visual impact.
                        </p>
                    </motion.div>

                </div>

                {/* Progress Indicator */}
                <motion.div
                    className="absolute bottom-10 left-10 h-1 bg-primary box-neon"
                    style={{ width: "100px", scaleX: scrollYProgress, transformOrigin: "0%", willChange: "transform" }}
                />
            </div>
        </section>
    )
}
