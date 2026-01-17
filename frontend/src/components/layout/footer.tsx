import Link from "@/components/ui/link-shim"
import { Facebook, Instagram, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t bg-muted/30 pt-16 pb-8">
            <div className="container px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-4">
                        <Link href="/" className="font-serif text-2xl font-medium">
                            Carmella
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Handcrafted ceramics and home essentials for the modern retailer.
                            Elevating spaces with sustainable beauty.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-serif text-lg mb-6">Shop</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/catalog" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                            <li><Link href="/catalog?category=tableware" className="hover:text-primary transition-colors">Tableware</Link></li>
                            <li><Link href="/catalog?category=decor" className="hover:text-primary transition-colors">Home Decor</Link></li>
                            <li><Link href="/catalog?category=holiday" className="hover:text-primary transition-colors">Holiday Collection</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-serif text-lg mb-6">Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Wholesaler Application</Link></li>
                            <li><Link href="/about" className="hover:text-primary transition-colors">Sustainability</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-serif text-lg mb-6">Stay Connected</h4>
                        <div className="flex gap-4 mb-6">
                            <Link href="#" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear()} Carmella. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
