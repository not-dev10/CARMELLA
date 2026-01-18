"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuth } from "@/contexts/AuthContext"
import Link from "@/components/ui/link-shim"

const easeOutExpo = (x: number): number => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

interface SearchResult {
    id: string
    name: string
    category: string
    image?: string
    price: number
}

interface SearchBarProps {
    onSearch?: (query: string) => void
    className?: string
    placeholder?: string
}

export function SearchBar({ onSearch, className, placeholder = "Search products..." }: SearchBarProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const debouncedQuery = useDebounce(searchQuery, 300)
    const { user } = useAuth()

    // Simulate search API call
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([])
            return
        }

        setIsLoading(true)
        // Simulate API call delay
        const timer = setTimeout(() => {
            // Mock results - replace with actual API call
            const mockResults: SearchResult[] = [
                {
                    id: "1",
                    name: `${debouncedQuery} Ceramic Plate`,
                    category: "Tableware",
                    price: 45.99,
                },
                {
                    id: "2",
                    name: `${debouncedQuery} Pottery Vase`,
                    category: "Home Decor",
                    price: 89.99,
                },
                {
                    id: "3",
                    name: `${debouncedQuery} Linen Tablecloth`,
                    category: "Textiles",
                    price: 62.50,
                },
            ].filter(item =>
                item.name.toLowerCase().includes(debouncedQuery.toLowerCase())
            )

            setResults(mockResults)
            setIsLoading(false)
            onSearch?.(debouncedQuery)
        }, 200)

        return () => clearTimeout(timer)
    }, [debouncedQuery, onSearch])

    const isExpanded = isHovered || isFocused || searchQuery.length > 0

    return (
        <div className={cn("relative", className)}>
            <motion.div
                className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
                    "bg-muted/50 backdrop-blur-md border border-border",
                    "hover:border-primary/50 focus-within:border-primary/50",
                    isExpanded && "shadow-lg border-primary/50"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false)
                    if (!isFocused) {
                        setSearchQuery("")
                    }
                }}
                animate={{
                    width: isExpanded ? 400 : 200,
                }}
                transition={{ duration: 0.6, ease: easeOutExpo }}
            >
                {/* Search Icon */}
                <motion.div
                    animate={{ color: isExpanded ? "#6B7051" : "currentColor" }}
                    className="flex-shrink-0"
                >
                    <Search className="h-4 w-4 text-muted-foreground" />
                </motion.div>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="bg-transparent text-foreground placeholder-muted-foreground focus:outline-none flex-1 text-sm"
                />

                {/* Clear Button */}
                {searchQuery && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSearchQuery("")}
                        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </motion.button>
                )}
            </motion.div>

            {/* Dropdown Results */}
            {isExpanded && (searchQuery || isLoading) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-50"
                >
                    {isLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-100" />
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-200" />
                            </div>
                            <p className="text-xs mt-2">Searching...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto">
                            {results.map((result) => (
                                <Link
                                    key={result.id}
                                    href={`/catalog/${result.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0 group"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                            {result.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {result.category}
                                        </p>
                                    </div>
                                    {user ? (
                                        <p className="text-sm font-semibold text-primary">
                                            ${result.price.toFixed(2)}
                                        </p>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs font-medium text-primary">
                                            <Lock className="h-3 w-3" />
                                            <span>Sign in</span>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-muted-foreground">
                            <p className="text-sm">No products found</p>
                        </div>
                    )}

                    {/* View All Results Link */}
                    {results.length > 0 && (
                        <div className="border-t border-border p-3 text-center">
                            <Link
                                href={`/catalog?search=${searchQuery}`}
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                View all results →
                            </Link>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}
