import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/lib/api"

interface CollectionContent {
  leftLabel: string
  leftTitle: string
  leftButtonText: string
  rightLabel: string
  rightTitle: string
  rightButtonText: string
}

const DEFAULT_CONTENT: CollectionContent = {
  leftLabel: "New Arrivals",
  leftTitle: "Autumn Ceramics",
  leftButtonText: "Shop Collection",
  rightLabel: "Curated",
  rightTitle: "Sustainable Living",
  rightButtonText: "Discover More",
}

export function CollectionSplit() {
    const [content, setContent] = useState<CollectionContent>(DEFAULT_CONTENT)

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/homepage/content/collection`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.content) {
                        setContent({
                            leftLabel: data.content.leftLabel || DEFAULT_CONTENT.leftLabel,
                            leftTitle: data.content.leftTitle || DEFAULT_CONTENT.leftTitle,
                            leftButtonText: data.content.leftButtonText || DEFAULT_CONTENT.leftButtonText,
                            rightLabel: data.content.rightLabel || DEFAULT_CONTENT.rightLabel,
                            rightTitle: data.content.rightTitle || DEFAULT_CONTENT.rightTitle,
                            rightButtonText: data.content.rightButtonText || DEFAULT_CONTENT.rightButtonText,
                        })
                    }
                }
            } catch (error) {
                console.error("Failed to fetch collection section content:", error)
            }
        }

        fetchContent()
    }, [])
    return (
        <section className="flex flex-col md:flex-row">
            {/* Panel 1 */}
            <div className="w-full md:w-1/2 section-gradient-accent p-16 md:p-24 flex flex-col justify-center items-center text-center group overflow-hidden relative">
                <FadeIn>
                    <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 block">{content.leftLabel}</span>
                    <h2 className="font-serif text-4xl md:text-5xl mb-8 font-medium tracking-tight text-gradient">{content.leftTitle}</h2>
                    <Button 
                        variant="outline" 
                        className="rounded-full bg-transparent border-primary/30 hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-primary-foreground transition-all duration-300 hover:shadow-lg font-medium"
                    >
                        {content.leftButtonText}
                    </Button>
                </FadeIn>
                <div className="absolute inset-0 border-[1px] border-primary/10 m-4 pointer-events-none" />
            </div>

            {/* Panel 2 */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground p-16 md:p-24 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                <FadeIn delay={0.2}>
                    <span className="text-xs font-bold tracking-widest uppercase text-white/70 mb-4 block">{content.rightLabel}</span>
                    <h2 className="font-serif text-4xl md:text-5xl mb-8 font-medium tracking-tight">{content.rightTitle}</h2>
                    <Button 
                        variant="secondary" 
                        className="rounded-full btn-gradient-warm transition-all duration-300 hover:shadow-lg font-medium"
                    >
                        {content.rightButtonText}
                    </Button>
                </FadeIn>
                {/* Texture overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] pointer-events-none mix-blend-overlay"></div>
            </div>
        </section>
    )
}
