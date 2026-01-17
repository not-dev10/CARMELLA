"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { ProductGrid } from "./product-grid"

export function RelatedProducts() {
    return (
        <section className="bg-muted/20 py-16 md:py-24 border-t">
            <div className="container mx-auto px-6">
                <FadeIn>
                    <h2 className="font-serif text-3xl md:text-4xl mb-12 text-center">You May Also Like</h2>
                    {/* We reuse the grid for now, in reality we'd filter out the current product */}
                    <ProductGrid />
                </FadeIn>
            </div>
        </section>
    )
}
