import { FadeIn } from "@/components/animations/fade-in"
import { Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CatalogHeader() {
    return (
        <div className="bg-muted/30 py-16 px-6">
            <div className="container mx-auto">
                <FadeIn>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-foreground">
                                Wholesale Catalog
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                Explore our curated collection of artisanal ceramics and home essentials.
                                Designed for modern living spaces.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        Sort by: Featured
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Featured</DropdownMenuItem>
                                    <DropdownMenuItem>Newest</DropdownMenuItem>
                                    <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                                    <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    )
}
