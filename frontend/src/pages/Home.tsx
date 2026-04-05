import { HeroSection } from "@/components/sections/hero"
import { CategoriesSection } from "@/components/sections/categories"
import { BrandQuote } from "@/components/sections/brand-quote"
import { CollectionSplit } from "@/components/sections/collection-split"
import { ProductShowcase } from "@/components/sections/product-showcase"
import { GivingBack } from "@/components/sections/giving-back"
import { Testimonials } from "@/components/sections/testimonials"
import { Newsletter } from "@/components/sections/newsletter"

export default function Home() {
    return (
        <div className="flex flex-col gap-0">
            <HeroSection />
            <CategoriesSection />
            <BrandQuote />
            <CollectionSplit />
            <ProductShowcase />
            <GivingBack />
            <Testimonials />
            <Newsletter />
        </div>
    )
}
