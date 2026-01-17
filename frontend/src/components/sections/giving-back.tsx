import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { ParallaxImage } from "@/components/animations/parallax"

export function GivingBack() {
    return (
        <section className="flex flex-col md:flex-row min-h-[600px]">
            <div className="w-full md:w-1/2 bg-gradient-to-br from-secondary via-secondary to-secondary/95 text-secondary-foreground p-16 md:p-24 flex flex-col justify-center">
                <FadeIn>
                    <span className="text-xs font-bold tracking-widest uppercase opacity-80 mb-4 block">Community Impact</span>
                    <h2 className="font-serif text-4xl md:text-5xl mb-8 font-medium tracking-tight">Giving Back to the Community</h2>
                    <p className="text-lg opacity-95 leading-relaxed mb-12 max-w-md">
                        An additional 10% of proceeds from our best-selling Poetry Mug go to charities that support local artisans and fair trade practices.
                    </p>
                    <Button 
                        variant="outline" 
                        className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary self-start rounded-full px-8 h-12 font-medium transition-all duration-300 hover:shadow-lg"
                    >
                        Our Giving Program
                    </Button>
                </FadeIn>
            </div>
            <div className="w-full md:w-1/2 bg-muted relative h-[600px] md:h-auto overflow-hidden group">
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none" />
                
                <ParallaxImage
                    src="https://images.unsplash.com/photo-1459156212016-c812468e2115?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Artisan working on pottery"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    containerClassName="absolute inset-0 w-full h-full"
                    scale={1.3}
                />
            </div>
        </section>
    )
}
