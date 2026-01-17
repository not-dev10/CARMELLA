"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useRef, useState, useCallback } from "react"

interface MagneticButtonProps extends ButtonProps {
    strength?: number
}

export function MagneticButton({
    children,
    className,
    strength = 25,
    ...props
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const { clientX, clientY } = e
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 }

        const x = (clientX - (left + width / 2)) / width * strength
        const y = (clientY - (top + height / 2)) / height * strength

        setPosition({ x, y })
    }, [strength])

    const handleMouseLeave = useCallback(() => {
        setPosition({ x: 0, y: 0 })
    }, [])

    return (
        <motion.div
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.05 }}
            style={{ willChange: "transform" }}
        >
            <Button
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={className}
                {...props}
            >
                {children}
            </Button>
        </motion.div>
    )
}
