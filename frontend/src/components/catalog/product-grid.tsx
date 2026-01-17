"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import Image from "@/components/ui/image-shim"
import { Badge } from "@/components/ui/badge"
import Link from "@/components/ui/link-shim"

const PRODUCTS = [
    {
        id: 1,
        name: "Ceramic Vase - Terra",
        price: "$45.00",
        category: "Vases",
        image: "https://images.unsplash.com/photo-1581783342308-f792ca11df53?auto=format&fit=crop&q=80&w=800",
        tag: "New"
    },
    {
        id: 2,
        name: "Minimalist Planter",
        price: "$32.00",
        category: "Planters",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 3,
        name: "Stoneware Mug Set",
        price: "$68.00",
        category: "Tableware",
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800",
        tag: "Best Seller"
    },
    {
        id: 4,
        name: "Woven Jute Basket",
        price: "$55.00",
        category: "Storage",
        image: "https://images.unsplash.com/photo-1595188734994-2e94b225c9db?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 5,
        name: "Glass Carafe",
        price: "$48.00",
        category: "Tableware",
        image: "https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 6,
        name: "Linen Table Runner",
        price: "$85.00",
        category: "Textiles",
        image: "https://images.unsplash.com/photo-1595306669968-3d5272a445bd?auto=format&fit=crop&q=80&w=800",
    }
]

export function ProductGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {PRODUCTS.map((product, index) => (
                <FadeIn key={product.id} delay={index * 0.1}>
                    <Link href={`/catalog/${product.id}`} className="group block">
                        <div className="relative aspect-[4/5] overflow-hidden bg-muted mb-4">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {product.tag && (
                                <Badge className="absolute top-4 left-4 bg-background/90 text-foreground hover:bg-background/100">
                                    {product.tag}
                                </Badge>
                            )}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <Button className="w-full bg-white text-black hover:bg-white/90">
                                    Quick Add
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                                <h3 className="font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                                    {product.name}
                                </h3>
                            </div>
                            <span className="font-medium text-foreground">{product.price}</span>
                        </div>
                    </Link>
                </FadeIn>
            ))}
        </div>
    )
}
