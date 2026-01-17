import { FadeIn } from "@/components/animations/fade-in"
import Link from "@/components/ui/link-shim"
import { ArrowRight } from "lucide-react"
import { Marquee } from "@/components/animations/marquee"

export function BrandQuote() {
    return (
        <section className="relative bg-gradient-to-b from-background via-background to-primary/5 py-40 px-6 overflow-hidden">
            <div className="container mx-auto max-w-4xl text-center relative z-10">
                <FadeIn direction="up">
                    <blockquote className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight text-gradient mb-12 font-medium tracking-tight">
                        "We believe that every object in your home should tell a story.
                        Our mission is to bring intention and beauty back into everyday rituals."
                    </blockquote>
                </FadeIn>

                <FadeIn delay={0.2} className="relative z-10">
                    <Link href="/about" className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:text-primary transition-colors group">
                        About Our Studio
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </FadeIn>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full -rotate-6 pointer-events-none opacity-30 z-0">
                <Marquee items={["Artisan", "Handcrafted", "Sustainable", "Timeless", "Organic"]} />
            </div>

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/3 pointer-events-none" />
        </section>
    )
}
