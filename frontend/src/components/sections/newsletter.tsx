import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
    return (
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-12 sm:py-20 md:py-32 px-3 sm:px-6 text-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 mix-blend-overlay" style={{
                backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 /%3E%3C/filter%3E%3Crect width=%22400%22 height=%22400%22 filter=%22url(%23noise)%22 /%3E%3C/svg%3E')",
            }} />

            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl -mr-32 sm:-mr-48 -mt-32 sm:-mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl -ml-32 sm:-ml-48 -mb-32 sm:-mb-48 pointer-events-none" />

            <div className="container mx-auto max-w-2xl relative z-10">
                <FadeIn direction="up">
                    <span className="text-xs font-bold tracking-widest uppercase opacity-80 mb-3 sm:mb-4 block">Get Involved</span>
                    <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 font-medium tracking-tight">Subscribe to Our Newsletter</h2>
                    <p className="text-sm sm:text-base md:text-lg primary-foreground/90 mb-8 sm:mb-12 leading-relaxed px-2 sm:px-0">
                        Join our trade program updates and get early access to new collections and exclusive B2B wholesale offers.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto px-2 sm:px-0">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-primary-foreground/15 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 h-11 sm:h-14 rounded-full px-4 sm:px-6 backdrop-blur-sm transition-all duration-300 focus:bg-primary-foreground/25 focus:border-primary-foreground/50 focus:outline-none text-sm sm:text-base"
                        />
                        <Button className="btn-gradient-warm h-11 sm:h-14 px-6 sm:px-8 rounded-full font-medium text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:scale-105">
                            Subscribe
                        </Button>
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}
