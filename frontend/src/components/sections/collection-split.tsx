import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"


export function CollectionSplit() {
    return (
        <section className="flex flex-col md:flex-row">
            {/* Panel 1 */}
            <div className="w-full md:w-1/2 section-gradient-accent p-16 md:p-24 flex flex-col justify-center items-center text-center group overflow-hidden relative">
                <FadeIn>
                    <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 block">New Arrivals</span>
                    <h2 className="font-serif text-4xl md:text-5xl mb-8 font-medium tracking-tight text-gradient">Autumn Ceramics</h2>
                    <Button 
                        variant="outline" 
                        className="rounded-full bg-transparent border-primary/30 hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-primary-foreground transition-all duration-300 hover:shadow-lg font-medium"
                    >
                        Shop Collection
                    </Button>
                </FadeIn>
                <div className="absolute inset-0 border-[1px] border-primary/10 m-4 pointer-events-none" />
            </div>

            {/* Panel 2 */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground p-16 md:p-24 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                <FadeIn delay={0.2}>
                    <span className="text-xs font-bold tracking-widest uppercase text-white/70 mb-4 block">Curated</span>
                    <h2 className="font-serif text-4xl md:text-5xl mb-8 font-medium tracking-tight">Sustainable Living</h2>
                    <Button 
                        variant="secondary" 
                        className="rounded-full btn-gradient-warm transition-all duration-300 hover:shadow-lg font-medium"
                    >
                        Discover More
                    </Button>
                </FadeIn>
                {/* Texture overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] pointer-events-none mix-blend-overlay"></div>
            </div>
        </section>
    )
}
