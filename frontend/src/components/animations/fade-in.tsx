"use client"

import { motion } from "framer-motion"

interface FadeInProps {
    children: React.ReactNode
    delay?: number
    className?: string
    direction?: "up" | "down" | "left" | "right"
}

export function FadeIn({ children, delay = 0, className, direction = "up" }: FadeInProps) {
    const directions = {
        up: { y: 30, x: 0 },
        down: { y: -30, x: 0 },
        left: { x: 30, y: 0 },
        right: { x: -30, y: 0 },
    }

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: "0px 0px -50px 0px" }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
