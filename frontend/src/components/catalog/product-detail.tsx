"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Heart, Info } from "lucide-react"
import Image from "@/components/ui/image-shim"
import { useState } from "react"

// Mock data - in a real app this would fetch based on slug
// Mock data database - keyed by ID for demonstration
interface Product {
    id: number;
    name: string;
    price: number;
    sku: string;
    description: string;
    dimensions: string;
    material: string;
    origin: string;
    category: string;
    images: string[];
}

const PRODUCTS_DB: Record<string, Product> = {
    "1": {
        id: 1,
        name: "Ceramic Vase - Terra",
        price: 45.00,
        sku: "VASE-T-001",
        category: "Vases",
        description: "Hand-thrown ceramic vase with a warm, earthy terracotta finish. Each piece is unique, featuring subtle variations in texture and glaze. Perfect for dried florals or as a standalone sculptural piece.",
        dimensions: "10\" H x 6\" W",
        material: "Stoneware Clay",
        origin: "Handmade in Portugal",
        images: [
            "https://images.unsplash.com/photo-1581783342308-f792ca11df53?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    "2": {
        id: 2,
        name: "Minimalist Planter",
        price: 32.00,
        sku: "PLANT-M-002",
        category: "Planters",
        description: "A sleek, modern planter designed for contemporary spaces. Features a drainage hole and matching saucer. The matte white finish complements any plant variety.",
        dimensions: "6\" H x 7\" W",
        material: "Ceramic",
        origin: "Designed in Denmark",
        images: [
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    "3": {
        id: 3,
        name: "Stoneware Mug Set",
        price: 68.00,
        sku: "MUG-S-003",
        category: "Tableware",
        description: "Set of 4 handcrafted stoneware mugs. Each mug has a comfortable handle and holds 12oz of your favorite beverage. Microwave and dishwasher safe.",
        dimensions: "3.5\" H x 3\" W",
        material: "Stoneware",
        origin: "Handmade in Vermont",
        images: [
            "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1577979653119-e5e4708f69eb?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    "4": {
        id: 4,
        name: "Woven Jute Basket",
        price: 55.00,
        sku: "BASK-J-004",
        category: "Storage",
        description: "Natural jute basket woven by skilled artisans. Sturdy handles make it perfect for storing blankets, throws, or toys. Adds a touch of warmth and texture to any room.",
        dimensions: "14\" H x 16\" W",
        material: "100% Jute",
        origin: "Fair Trade - Bangladesh",
        images: [
            "https://images.unsplash.com/photo-1595188734994-2e94b225c9db?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1620242200778-95d4bfe8a04b?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    "5": {
        id: 5,
        name: "Glass Carafe",
        price: 48.00,
        sku: "GLASS-C-005",
        category: "Tableware",
        description: "Elegant mouth-blown glass carafe with a unique rippled texture. Perfect for serving water, juice, or wine. A sophisticated addition to any dining table.",
        dimensions: "10\" H x 4\" W",
        material: "Recycled Glass",
        origin: "Made in Spain",
        images: [
            "https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1572119865084-43c2c5c99371?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    "6": {
        id: 6,
        name: "Linen Table Runner",
        price: 85.00,
        sku: "LINEN-R-006",
        category: "Textiles",
        description: "Premium European linen table runner in a neutral oatmeal shade. Pre-washed for softness and a relaxed look. Features mitered corners and a generous hem.",
        dimensions: "16\" W x 90\" L",
        material: "100% Linen",
        origin: "Woven in Lithuania",
        images: [
            "https://images.unsplash.com/photo-1595306669968-3d5272a445bd?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1595306669968-0775d742f38d?auto=format&fit=crop&q=80&w=1200"
        ]
    }
}

export function ProductDetail({ slug }: { slug: string }) {
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState(0)

    const product = PRODUCTS_DB[slug] || PRODUCTS_DB["1"]

    const increment = () => setQuantity(q => q + 1)
    const decrement = () => setQuantity(q => q > 1 ? q - 1 : 1)

    // Reset active image when slug changes
    // In a real app with proper routing, the component remounts or we'd use useEffect

    return (
        <section className="container mx-auto px-6 py-12 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

                {/* Image Gallery */}
                <FadeIn className="space-y-4">
                    <div className="relative aspect-[4/5] bg-muted overflow-hidden rounded-sm">
                        <Image
                            src={product.images[activeImage]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {product.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`relative aspect-square bg-muted overflow-hidden rounded-sm border-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
                            >
                                <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                </FadeIn>

                {/* Product Info */}
                <FadeIn delay={0.2} className="flex flex-col">
                    <div className="mb-2">
                        <span className="text-sm tracking-widest uppercase text-muted-foreground mr-4">{product.category}</span>
                        <Badge variant="secondary" className="rounded-full">In Stock</Badge>
                    </div>

                    <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">{product.name}</h1>
                    <p className="text-2xl font-medium mb-6">${product.price.toFixed(2)}</p>

                    <div className="prose prose-stone text-muted-foreground mb-8">
                        <p>{product.description}</p>
                    </div>

                    <Separator className="my-6" />

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                        <div>
                            <span className="font-semibold block text-foreground">Dimensions</span>
                            <span className="text-muted-foreground">{product.dimensions}</span>
                        </div>
                        <div>
                            <span className="font-semibold block text-foreground">Material</span>
                            <span className="text-muted-foreground">{product.material}</span>
                        </div>
                        <div>
                            <span className="font-semibold block text-foreground">Origin</span>
                            <span className="text-muted-foreground">{product.origin}</span>
                        </div>
                        <div>
                            <span className="font-semibold block text-foreground">SKU</span>
                            <span className="text-muted-foreground">{product.sku}</span>
                        </div>
                    </div>

                    <Separator className="mb-8" />

                    {/* Actions */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center border rounded-md">
                                <button onClick={decrement} className="p-3 hover:bg-muted transition-colors"><Minus className="h-4 w-4" /></button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button onClick={increment} className="p-3 hover:bg-muted transition-colors"><Plus className="h-4 w-4" /></button>
                            </div>
                            <Button size="lg" className="flex-1 h-12 text-base">
                                Add to Order
                            </Button>
                            <Button variant="outline" size="icon" className="h-12 w-12">
                                <Heart className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3">
                            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium mb-1">Wholesale Pricing Available</p>
                                <p className="text-muted-foreground">Log in to your B2B account to view tier-based pricing and bulk discounts.</p>
                            </div>
                        </div>
                    </div>

                </FadeIn>
            </div>
        </section>
    )
}
