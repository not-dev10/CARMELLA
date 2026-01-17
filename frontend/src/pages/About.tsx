"use client"

import { motion } from "framer-motion"
import { Award, Users, Heart, Leaf, Globe, TrendingUp } from "lucide-react"
import Image from "@/components/ui/image-shim"
import { FadeIn } from "@/components/animations/fade-in"

const STATS = [
    { icon: Users, value: "500+", label: "Retail Partners" },
    { icon: Globe, value: "30+", label: "Countries" },
    { icon: Award, value: "15+", label: "Years Experience" },
    { icon: TrendingUp, value: "98%", label: "Client Satisfaction" }
]

const VALUES = [
    {
        icon: Heart,
        title: "Craftsmanship",
        description: "Every piece is handcrafted by skilled artisans, ensuring unique character and exceptional quality."
    },
    {
        icon: Leaf,
        title: "Sustainability",
        description: "We use eco-friendly materials and ethical production practices to minimize our environmental impact."
    },
    {
        icon: Users,
        title: "Partnership",
        description: "We build long-term relationships with our B2B clients, offering dedicated support and custom solutions."
    },
    {
        icon: Award,
        title: "Excellence",
        description: "Our commitment to quality and innovation has made us a trusted name in the ceramics industry."
    }
]

export default function About() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://picsum.photos/seed/about-hero/1920/1080"
                        alt="About Carmella"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <FadeIn>
                        <span className="text-xs font-bold tracking-widest uppercase mb-4 block opacity-90">
                            Est. 2024
                        </span>
                        <h1 className="font-serif text-5xl md:text-7xl font-medium mb-6">
                            Artistry in Every Detail
                        </h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
                            Handcrafted ceramics and home essentials for the modern retailer
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {STATS.map((stat, index) => (
                            <FadeIn key={index} delay={index * 0.1}>
                                <div className="text-center">
                                    <stat.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                                    <div className="font-serif text-4xl md:text-5xl font-bold mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground uppercase tracking-wide">
                                        {stat.label}
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-24 px-6">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <FadeIn>
                            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                                <Image
                                    src="https://picsum.photos/seed/about-story/800/1000"
                                    alt="Our Story"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </FadeIn>
                        <FadeIn delay={0.2}>
                            <div>
                                <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 block">
                                    Our Story
                                </span>
                                <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">
                                    Crafting Beauty Since 2024
                                </h2>
                                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                                    <p>
                                        Carmella was born from a passion for timeless design and sustainable craftsmanship.
                                        We believe that everyday objects should be beautiful, functional, and made to last.
                                    </p>
                                    <p>
                                        Working with skilled artisans across Europe, we create ceramics and home essentials
                                        that blend traditional techniques with contemporary aesthetics. Each piece tells a
                                        story of dedication, skill, and attention to detail.
                                    </p>
                                    <p>
                                        Today, we're proud to partner with over 500 retailers worldwide, helping them
                                        elevate their inventory with our curated B2B collections.
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 px-6 bg-muted/30">
                <div className="container mx-auto">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 block">
                                Our Values
                            </span>
                            <h2 className="font-serif text-4xl md:text-5xl font-medium">
                                What Drives Us
                            </h2>
                        </div>
                    </FadeIn>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {VALUES.map((value, index) => (
                            <FadeIn key={index} delay={index * 0.1}>
                                <div className="bg-background rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <value.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-semibold mb-4">{value.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="container mx-auto">
                    <FadeIn>
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-12 md:p-16 text-center">
                            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">
                                Ready to Partner With Us?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Join hundreds of retailers worldwide who trust Carmella for premium ceramics and home essentials.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/catalog"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Browse Catalog
                                </a>
                                <a
                                    href="/contact"
                                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    Contact Us
                                </a>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </div>
    )
}
