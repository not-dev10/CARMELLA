import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
    return (
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-32 px-6 text-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 mix-blend-overlay" style={{
                backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 /%3E%3C/filter%3E%3Crect width=%22400%22 height=%22400%22 filter=%22url(%23noise)%22 /%3E%3C/svg%3E')",
            }} />

            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none" />

            <div className="container mx-auto max-w-2xl relative z-10">
                <FadeIn direction="up">
                    <span className="text-xs font-bold tracking-widest uppercase opacity-80 mb-4 block">Get Involved</span>
                    <h2 className="font-serif text-5xl md:text-6xl mb-6 font-medium tracking-tight">Subscribe to Our Newsletter</h2>
                    <p className="text-lg primary-foreground/90 mb-12 leading-relaxed">
                        Join our trade program updates and get early access to new collections and exclusive B2B wholesale offers.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-primary-foreground/15 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 h-14 rounded-full px-6 backdrop-blur-sm transition-all duration-300 focus:bg-primary-foreground/25 focus:border-primary-foreground/50 focus:outline-none"
                        />
                        <Button className="btn-gradient-warm h-14 px-8 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
                            Subscribe
                        </Button>
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}
