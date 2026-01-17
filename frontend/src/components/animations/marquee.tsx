"use client"

import { cn } from "@/lib/utils"

interface MarqueeProps {
    items: string[]
    direction?: "left" | "right"
    speed?: number
    className?: string
}

export function Marquee({
    items,
    direction = "left",
    speed = 20,
    className
}: MarqueeProps) {
    const animationDirection = direction === "left" ? "marquee-left" : "marquee-right"
    
    return (
        <div className={cn("flex overflow-hidden whitespace-nowrap", className)}>
            <style>{`
                @keyframes marquee-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee-right {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .marquee-animate {
                    animation: ${animationDirection} ${speed}s linear infinite;
                    will-change: transform;
                }
            `}</style>
            <div className="marquee-animate flex gap-12 text-6xl font-serif text-muted-foreground/20 uppercase tracking-widest font-bold items-center py-6">
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="flex items-center gap-12 flex-shrink-0">
                        {item}
                        <span className="w-3 h-3 rounded-full bg-current opacity-30" />
                    </span>
                ))}
            </div>
        </div>
    )
}
