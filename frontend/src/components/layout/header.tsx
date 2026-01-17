"use client"

import Link from "@/components/ui/link-shim"
import { Search, ShoppingBag, User, Menu, FileText, Package, Heart, Settings, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Image from "@/components/ui/image-shim"
import { useAuth } from "@/contexts/AuthContext"


const CATALOG_CATEGORIES = [
    {
        name: "Tableware",
        image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=300&h=200&fit=crop",
        subcategories: ["Plates & Bowls", "Mugs & Cups", "Serving Dishes"]
    },
    {
        name: "Home Decor",
        image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=300&h=200&fit=crop",
        subcategories: ["Vases", "Planters", "Decorative Objects"]
    },
    {
        name: "Textiles",
        image: "https://images.unsplash.com/photo-1595306669968-3d5272a445bd?w=300&h=200&fit=crop",
        subcategories: ["Table Linens", "Cushions", "Throws"]
    },
    {
        name: "Lighting",
        image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300&h=200&fit=crop",
        subcategories: ["Table Lamps", "Pendant Lights", "Candle Holders"]
    }
]

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [searchFocused, setSearchFocused] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [showMegaMenu, setShowMegaMenu] = useState(false)
    const { user, signOut } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)

            // Calculate scroll progress
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
            const scrolled = (window.scrollY / windowHeight) * 100
            setScrollProgress(scrolled)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
                style={{ scaleX: scrollProgress / 100 }}
                initial={{ scaleX: 0 }}
            />

            <header
                className={cn(
                    "sticky top-0 z-40 w-full border-b transition-all duration-300",
                    isScrolled
                        ? "border-border/50 bg-background/95 backdrop-blur-md shadow-sm"
                        : "border-transparent bg-background"
                )}
            >
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="font-serif text-2xl text-left">Carmella</SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-4 mt-8">
                                    <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                                        Home
                                    </Link>
                                    <Link href="/catalog" className="text-lg font-medium hover:text-primary transition-colors">
                                        Catalog
                                    </Link>
                                    <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
                                        About
                                    </Link>
                                    <Link href="/contact" className="text-lg font-medium hover:text-primary transition-colors">
                                        Contact
                                    </Link>
                                    <Button className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Request Catalog
                                    </Button>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo */}
                    <Link href="/" className="font-serif text-3xl font-medium tracking-tight text-gradient md:mr-0 mr-auto ml-4 md:ml-0 hover:text-primary transition-colors">
                        Carmella
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-10">
                        <Link href="/" className="text-sm font-medium uppercase tracking-wide text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-primary decoration-2 transition-all">
                            Home
                        </Link>

                        {/* Catalog with Mega Menu */}
                        <div
                            className="relative"
                            onMouseEnter={() => setShowMegaMenu(true)}
                            onMouseLeave={() => setShowMegaMenu(false)}
                        >
                            <Link
                                href="/catalog"
                                className="text-sm font-medium uppercase tracking-wide text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-primary decoration-2 transition-all flex items-center gap-1"
                            >
                                Catalog
                                <ChevronDown className="w-3 h-3" />
                            </Link>

                            {/* Mega Menu */}
                            {showMegaMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-card border border-border rounded-lg shadow-2xl p-6 grid grid-cols-2 gap-4"
                                >
                                    {CATALOG_CATEGORIES.map((category) => (
                                        <Link
                                            key={category.name}
                                            href={`/catalog?category=${category.name.toLowerCase()}`}
                                            className="group flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <div className="relative w-24 h-20 rounded overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={category.image}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-serif text-base font-semibold mb-1 group-hover:text-primary transition-colors">
                                                    {category.name}
                                                </h4>
                                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                                    {category.subcategories.map((sub) => (
                                                        <li key={sub}>{sub}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        <Link href="/about" className="text-sm font-medium uppercase tracking-wide text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-primary decoration-2 transition-all">
                            About
                        </Link>
                        <Link href="/contact" className="text-sm font-medium uppercase tracking-wide text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-primary decoration-2 transition-all">
                            Contact
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Glass Search Bar */}
                        <div className="hidden sm:flex items-center">
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                                "bg-muted/50 backdrop-blur-md border border-border hover:border-primary/50",
                                searchFocused && "w-64 border-primary/50 shadow-lg"
                            )}>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="bg-transparent text-foreground placeholder-muted-foreground focus:outline-none w-full text-sm"
                                />
                                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </div>
                        </div>

                        {/* Request Catalog CTA */}
                        <Button
                            size="sm"
                            className="hidden lg:flex btn-gradient-warm rounded-full gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Request Catalog
                        </Button>

                        <ModeToggle />

                        {/* Account Dropdown - Only show if logged in */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:text-primary hidden sm:flex">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <div className="text-xs text-muted-foreground px-2 py-1">{user.email}</div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>Orders</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Heart className="mr-2 h-4 w-4" />
                                        <span>Wishlist</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        className="text-destructive cursor-pointer"
                                        onClick={signOut}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2 hidden sm:flex">
                                <Link href="/login">
                                    <Button variant="outline" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm" className="btn-gradient">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <Button variant="ghost" size="icon" className="relative hover:text-primary">
                            <ShoppingBag className="h-5 w-5" />
                            <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary p-0 text-[10px] text-primary-foreground flex items-center justify-center">
                                0
                            </Badge>
                        </Button>
                    </div>
                </div>
            </header>
        </>
    )
}
