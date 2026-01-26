"use client"

import Link from "@/components/ui/link-shim"
import { Search, ShoppingBag, User, Menu, FileText, Package, Heart, Settings, LogOut, ChevronDown, X, CheckCircle, Clock, XCircle } from "lucide-react"
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
import { useCart } from "@/contexts/CartContext"
import { categoriesAPI, userAPI } from "@/lib/api"
import { MiniCart } from "./mini-cart"
import { useDebounce } from "@/hooks/useDebounce"

interface Category {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
}

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchFocused, setSearchFocused] = useState(false)
    const debouncedSearch = useDebounce(searchQuery, 500)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [showMegaMenu, setShowMegaMenu] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [cartOpen, setCartOpen] = useState(false)
    const [megaMenuTimeout, setMegaMenuTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
    const [logoHovered, setLogoHovered] = useState(false)
    const [showB2BModal, setShowB2BModal] = useState(false)
    const [b2bCompanyName, setB2bCompanyName] = useState("")
    const [b2bTaxId, setB2bTaxId] = useState("")
    const [b2bContactName, setB2bContactName] = useState("")
    const [b2bContactEmail, setB2bContactEmail] = useState("")
    const [b2bContactPhone, setB2bContactPhone] = useState("")
    const [b2bBusinessType, setB2bBusinessType] = useState("")
    const [b2bOrderQuantity, setB2bOrderQuantity] = useState("")
    const [b2bPurchaseFrequency, setB2bPurchaseFrequency] = useState("")
    const [b2bReason, setB2bReason] = useState("")
    const [requestingB2B, setRequestingB2B] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const { user, signOut } = useAuth()
    const { items } = useCart()

    const handleB2BRequest = async () => {
        if (!user || !b2bCompanyName.trim() || !b2bContactName.trim() || !b2bContactEmail.trim()) return

        try {
            setRequestingB2B(true)
            await userAPI.requestB2BAccess((user as any).id, {
                companyName: b2bCompanyName,
                taxId: b2bTaxId || undefined,
                contactName: b2bContactName,
                contactEmail: b2bContactEmail,
                contactPhone: b2bContactPhone || undefined,
                businessType: b2bBusinessType || undefined,
                orderQuantity: b2bOrderQuantity || undefined,
                purchaseFrequency: b2bPurchaseFrequency || undefined,
                reason: b2bReason || undefined,
            })
            
            // Show success modal
            setShowB2BModal(false)
            setShowSuccessModal(true)
            
            // Reset form
            setB2bCompanyName("")
            setB2bTaxId("")
            setB2bContactName("")
            setB2bContactEmail("")
            setB2bContactPhone("")
            setB2bBusinessType("")
            setB2bOrderQuantity("")
            setB2bPurchaseFrequency("")
            setB2bReason("")
            
            // Refresh after 3 seconds
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (err: any) {
            console.error("[HEADER] B2B request error:", err)
            setShowB2BModal(false)
            setErrorMessage(err.message || "Failed to submit request. Please try again.")
            setShowErrorModal(true)
        } finally {
            setRequestingB2B(false)
        }
    }

    // Handle debounced search
    useEffect(() => {
        if (debouncedSearch) {
            console.log("[HEADER] Search query:", debouncedSearch)
            // Add your search logic here
        }
    }, [debouncedSearch])

    // Lock body scroll when B2B modal is open (but allow modal content to scroll)
    useEffect(() => {
        if (showB2BModal) {
            // Prevent body scroll but allow modal scroll
            document.body.style.overflow = 'hidden'
            document.body.style.paddingRight = '0px' // Prevent layout shift
        } else {
            document.body.style.overflow = ''
            document.body.style.paddingRight = ''
        }
        
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = ''
            document.body.style.paddingRight = ''
        }
    }, [showB2BModal])

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true)
                const response = await categoriesAPI.getAll()
                setCategories(response.categories || [])
            } catch (error) {
                console.error("Failed to fetch categories:", error)
                setCategories([])
            } finally {
                setLoadingCategories(false)
            }
        }
        fetchCategories()
    }, [])

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

    const handleMegaMenuEnter = () => {
        if (megaMenuTimeout) {
            clearTimeout(megaMenuTimeout)
            setMegaMenuTimeout(null)
        }
        setShowMegaMenu(true)
    }

    const handleMegaMenuLeave = () => {
        const timeout = setTimeout(() => {
            setShowMegaMenu(false)
        }, 200)
        setMegaMenuTimeout(timeout)
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

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
                                    <Link href="/" onClick={scrollToTop} className="text-lg font-medium hover:text-primary transition-colors">
                                        Home
                                    </Link>
                                    <Link href="/catalog" onClick={scrollToTop} className="text-lg font-medium hover:text-primary transition-colors">
                                        Catalog
                                    </Link>
                                    <Link href="/about" onClick={scrollToTop} className="text-lg font-medium hover:text-primary transition-colors">
                                        About
                                    </Link>
                                    <Link href="/contact" onClick={scrollToTop} className="text-lg font-medium hover:text-primary transition-colors">
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
                    <Link href="/" className="flex items-center gap-2 md:mr-0 mr-auto ml-4 md:ml-0 group relative">
                        <motion.div
                            className="relative overflow-hidden rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onMouseEnter={() => setLogoHovered(true)}
                            onMouseLeave={() => setLogoHovered(false)}
                        >
                            <img src="/assets/CARMELLA LOGO .svg" alt="Carmella" className="h-20 w-auto relative z-10" />
                            
                            {/* Sliding glass shine effect */}
                            {logoHovered && (
                                <motion.div
                                    className="absolute inset-0 opacity-100"
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                </motion.div>
                            )}

                            {/* Golden sparkles */}
                            {logoHovered && (
                                <>
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                                            style={{
                                                left: `${Math.random() * 100}%`,
                                                top: `${Math.random() * 100}%`,
                                            }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                delay: i * 0.15,
                                                repeat: Infinity,
                                                repeatDelay: 0.5,
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-10">
                        <Link href="/" onClick={scrollToTop} className="text-sm font-medium uppercase tracking-wide text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-primary decoration-2 transition-all">
                            Home
                        </Link>

                        {/* Catalog with Mega Menu */}
                        <div
                            className="relative"
                            onMouseEnter={handleMegaMenuEnter}
                            onMouseLeave={handleMegaMenuLeave}
                        >
                            <Link
                                href="/catalog"
                                onClick={scrollToTop}
                                className="text-sm font-medium uppercase tracking-wide text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-primary decoration-2 transition-all flex items-center gap-1"
                            >
                                Catalog
                                <ChevronDown className="w-3 h-3" />
                            </Link>

                            {/* Mega Menu */}
                            {showMegaMenu && !loadingCategories && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    onMouseEnter={handleMegaMenuEnter}
                                    onMouseLeave={handleMegaMenuLeave}
                                    onWheel={(e) => e.stopPropagation()}
                                    className="absolute top-full left-0 right-0 mt-2 mx-auto max-w-[900px] w-[calc(100vw-48px)] bg-card border border-border rounded-lg shadow-2xl backdrop-blur-sm max-h-[600px] overflow-y-auto"
                                >
                                    <div className="p-8 grid grid-cols-3 gap-6">
                                        {categories.length > 0 ? (
                                            categories.map((category: any, index) => (
                                                <motion.div
                                                    key={category.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                                >
                                                    <Link
                                                        href={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                        onClick={scrollToTop}
                                                        className="group flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        {category.image_url && (
                                                            <div className="relative w-24 h-20 rounded overflow-hidden flex-shrink-0">
                                                                <Image
                                                                    src={category.image_url}
                                                                    alt={category.name}
                                                                    fill
                                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h4 className="font-serif text-base font-semibold mb-1 group-hover:text-primary transition-colors">
                                                                {category.name}
                                                            </h4>
                                                            {category.description && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {category.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="col-span-3 text-center py-4 text-muted-foreground">
                                                No categories available
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <Link href="/about" onClick={scrollToTop} className="text-sm font-medium uppercase tracking-wide text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-primary decoration-2 transition-all">
                            About
                        </Link>
                        <Link href="/contact" onClick={scrollToTop} className="text-sm font-medium uppercase tracking-wide text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-primary decoration-2 transition-all">
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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

                        {/* View Pricing / B2B Status Button */}
                        {!user ? (
                            // Non-logged in users - Vibrating button
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, -1, 1, -1, 0],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                }}
                            >
                                <Button
                                    size="sm"
                                    onClick={() => setShowB2BModal(true)}
                                    className="hidden lg:flex bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full gap-2 shadow-lg relative"
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                                    />
                                    <FileText className="w-4 h-4" />
                                    View Pricing
                                </Button>
                            </motion.div>
                        ) : (user as any)?.b2b_approval_status === 'approved' ? (
                            // Approved users - Green checkmark badge
                            <Badge className="hidden lg:flex bg-green-100 text-green-700 border-green-300 gap-2 px-3 py-1.5">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </motion.div>
                                B2B Approved
                            </Badge>
                        ) : (user as any)?.b2b_approval_status === 'pending' ? (
                            // Pending users - Yellow badge
                            <Badge className="hidden lg:flex bg-yellow-100 text-yellow-700 border-yellow-300 gap-2 px-3 py-1.5">
                                <Clock className="w-4 h-4" />
                                Approval Pending
                            </Badge>
                        ) : (
                            // Logged in but not requested - Vibrating button
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, -1, 1, -1, 0],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                }}
                            >
                                <Button
                                    size="sm"
                                    onClick={() => setShowB2BModal(true)}
                                    className="hidden lg:flex bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full gap-2 shadow-lg relative"
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                                    />
                                    <FileText className="w-4 h-4" />
                                    Request Approval
                                </Button>
                            </motion.div>
                        )}

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
                                    <Link href="/orders">
                                      <DropdownMenuItem>
                                          <Package className="mr-2 h-4 w-4" />
                                          <span>Orders</span>
                                      </DropdownMenuItem>
                                    </Link>
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

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="relative hover:text-primary"
                            onClick={() => setCartOpen(true)}
                        >
                            <ShoppingBag className="h-5 w-5" />
                            {items.length > 0 && (
                                <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary p-0 text-[10px] text-primary-foreground flex items-center justify-center">
                                    {items.length}
                                </Badge>
                            )}
                        </Button>
                        <MiniCart open={cartOpen} onOpenChange={setCartOpen} />
                    </div>
                </div>
            </header>

            {/* B2B Pricing Access Modal */}
            {showB2BModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowB2BModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden border border-border dark:border-gray-800"
                    >
                        {/* Decorative gradient */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
                        
                        {/* Close button */}
                        <button
                            onClick={() => setShowB2BModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-muted dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1
                                }}
                                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <FileText className="w-10 h-10 text-white" />
                            </motion.div>
                        </div>

                        {/* Content */}
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-black text-foreground">
                                {user ? "Request B2B Approval" : "Want to View Pricing?"}
                            </h3>
                            <p className="text-muted-foreground">
                                {user 
                                    ? "Fill out the form below to request B2B approval and access wholesale pricing."
                                    : "Sign up and request B2B approval to access our wholesale pricing and place orders."
                                }
                            </p>
                            
                            {user ? (
                                // Logged in - Show B2B request form
                                <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-muted dark:scrollbar-track-gray-800">
                                    {/* Contact Information Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wide border-b border-border dark:border-gray-800 pb-2">
                                            Contact Information
                                        </h4>
                                        
                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={b2bContactName}
                                                onChange={(e) => setB2bContactName(e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            />
                                        </div>

                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                value={b2bContactEmail}
                                                onChange={(e) => setB2bContactEmail(e.target.value)}
                                                placeholder="john@company.com"
                                                className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            />
                                        </div>

                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={b2bContactPhone}
                                                onChange={(e) => setB2bContactPhone(e.target.value)}
                                                placeholder="+1 (555) 123-4567"
                                                className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Business Information Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wide border-b border-border dark:border-gray-800 pb-2">
                                            Business Information
                                        </h4>

                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                Company Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={b2bCompanyName}
                                                onChange={(e) => setB2bCompanyName(e.target.value)}
                                                placeholder="Your Company Name"
                                                className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            />
                                        </div>

                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                Business Type
                                            </label>
                                            <select
                                                value={b2bBusinessType}
                                                onChange={(e) => setB2bBusinessType(e.target.value)}
                                                className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            >
                                                <option value="">Select business type</option>
                                                <option value="retailer">Retailer</option>
                                                <option value="wholesaler">Wholesaler</option>
                                                <option value="distributor">Distributor</option>
                                                <option value="interior_designer">Interior Designer</option>
                                                <option value="restaurant">Restaurant/Hospitality</option>
                                                <option value="online_store">Online Store</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                Tax ID / Business Number
                                            </label>
                                            <input
                                                type="text"
                                                value={b2bTaxId}
                                                onChange={(e) => setB2bTaxId(e.target.value)}
                                                placeholder="Tax ID or Business Number"
                                                className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Purchase Information Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wide border-b border-border dark:border-gray-800 pb-2">
                                            Purchase Information
                                        </h4>

                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                Expected Order Quantity
                                            </label>
                                            <select
                                                value={b2bOrderQuantity}
                                                onChange={(e) => setB2bOrderQuantity(e.target.value)}
                                                className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            >
                                                <option value="">Select quantity range</option>
                                                <option value="small">Small (1-50 units)</option>
                                                <option value="medium">Medium (51-200 units)</option>
                                                <option value="large">Large (201-500 units)</option>
                                                <option value="bulk">Bulk (500+ units)</option>
                                                <option value="mixed">Mixed - Both Small & Bulk</option>
                                            </select>
                                        </div>

                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                Purchase Frequency
                                            </label>
                                            <select
                                                value={b2bPurchaseFrequency}
                                                onChange={(e) => setB2bPurchaseFrequency(e.target.value)}
                                                className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            >
                                                <option value="">Select frequency</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="quarterly">Quarterly</option>
                                                <option value="annually">Annually</option>
                                                <option value="as_needed">As Needed</option>
                                            </select>
                                        </div>

                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                Reason for B2B Access
                                            </label>
                                            <textarea
                                                value={b2bReason}
                                                onChange={(e) => setB2bReason(e.target.value)}
                                                placeholder="Tell us about your business and why you need wholesale access..."
                                                rows={4}
                                                className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-left">
                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                            ⏱️ What happens next:
                                        </p>
                                        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                                            <li>• Your request will be reviewed by our team</li>
                                            <li>• Approval decision within 24 hours</li>
                                            <li>• You'll receive an email notification</li>
                                            <li>• Access wholesale pricing immediately after approval</li>
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={handleB2BRequest}
                                        disabled={!b2bCompanyName.trim() || !b2bContactName.trim() || !b2bContactEmail.trim() || requestingB2B}
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full py-6 text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {requestingB2B ? "Submitting..." : "Submit B2B Request"}
                                    </Button>
                                </div>
                            ) : (
                                // Not logged in - Show signup flow
                                <>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4 text-left">
                                        <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-2">
                                            ✨ How it works:
                                        </p>
                                        <ul className="text-sm text-orange-800 dark:text-orange-300 space-y-1">
                                            <li>• Sign up for a free account</li>
                                            <li>• Request B2B approval</li>
                                            <li>• Get approved within 24 hours</li>
                                            <li>• Access wholesale pricing & order</li>
                                        </ul>
                                    </div>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col gap-3 pt-4">
                                        <Link href="/signup">
                                            <Button
                                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full py-6 text-lg font-bold shadow-lg"
                                                onClick={() => setShowB2BModal(false)}
                                            >
                                                Sign Up & Request Approval
                                            </Button>
                                        </Link>
                                        <Link href="/login">
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-full py-6"
                                                onClick={() => setShowB2BModal(false)}
                                            >
                                                Already have an account? Log In
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowSuccessModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden border border-border dark:border-gray-800"
                    >
                        {/* Success gradient */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
                        
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <CheckCircle className="w-10 h-10 text-white" />
                            </motion.div>
                        </div>

                        {/* Content */}
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-black text-foreground">
                                Request Submitted!
                            </h3>
                            <p className="text-muted-foreground">
                                Your B2B approval request has been successfully submitted. Our team will review it and get back to you within 24 hours.
                            </p>
                            
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4 text-left">
                                <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                                    📧 Check your email
                                </p>
                                <p className="text-sm text-green-800 dark:text-green-300">
                                    You'll receive a confirmation email shortly with your request details and next steps.
                                </p>
                            </div>

                            <Button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full py-4 text-base font-bold shadow-lg"
                            >
                                Got it!
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowErrorModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden border border-border dark:border-gray-800"
                    >
                        {/* Error gradient */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />
                        
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <XCircle className="w-10 h-10 text-white" />
                            </motion.div>
                        </div>

                        {/* Content */}
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-black text-foreground">
                                Oops! Something went wrong
                            </h3>
                            <p className="text-muted-foreground">
                                {errorMessage || "We couldn't process your request. Please try again."}
                            </p>
                            
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 text-left">
                                <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                                    💡 What you can do:
                                </p>
                                <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                                    <li>• Check your internet connection</li>
                                    <li>• Make sure all required fields are filled</li>
                                    <li>• Try again in a few moments</li>
                                    <li>• Contact support if the issue persists</li>
                                </ul>
                            </div>

                            <Button
                                onClick={() => setShowErrorModal(false)}
                                className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-full py-4 text-base font-bold shadow-lg"
                            >
                                Try Again
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    )
}
