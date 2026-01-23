import Link from "@/components/ui/link-shim"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function Footer() {
    return (
        <footer className="relative overflow-hidden">
            {/* Blue and gold gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-amber-600 opacity-95" />
            
            {/* Animated gradient overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-cyan-600/30 via-blue-500/20 to-yellow-500/30"
                animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
                style={{ backgroundSize: "200% 200%" }}
            />

            {/* Decorative circles */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
            
            {/* Water droplets */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full backdrop-blur-sm"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}
            
            {/* Floating golden particles */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={`gold-${i}`}
                    className="absolute w-1 h-1 bg-amber-300/40 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                        duration: 4 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                    }}
                />
            ))}

            <div className="relative container px-6 pt-20 pb-8">
                {/* Main content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand section */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Link href="/" className="font-serif text-4xl font-black text-white flex items-center gap-3 tracking-tight">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <Sparkles className="w-7 h-7 text-amber-300" />
                                </motion.div>
                                Carmella
                            </Link>
                            <p className="text-base text-white/90 leading-relaxed mt-5 font-light tracking-wide max-w-xs">
                                Handcrafted ceramics and home essentials for the modern retailer.
                                Elevating spaces with sustainable beauty.
                            </p>
                        </motion.div>

                        {/* Contact info */}
                        <div className="space-y-3.5 text-sm text-white/80 font-medium">
                            <div className="flex items-center gap-3 hover:text-white transition-colors">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span className="tracking-wide">hello@carmella.com</span>
                            </div>
                            <div className="flex items-center gap-3 hover:text-white transition-colors">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span className="tracking-wide">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3 hover:text-white transition-colors">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="tracking-wide">Los Angeles, CA</span>
                            </div>
                        </div>
                    </div>

                    {/* Shop links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <h4 className="font-serif text-2xl mb-7 text-white font-black tracking-tight uppercase text-sm letter-spacing-wider">Shop</h4>
                        <ul className="space-y-3.5 text-sm">
                            {[
                                { label: "New Arrivals", href: "/catalog" },
                                { label: "Tableware", href: "/catalog?category=tableware" },
                                { label: "Home Decor", href: "/catalog?category=decor" },
                                { label: "Holiday Collection", href: "/catalog?category=holiday" },
                            ].map((item, i) => (
                                <motion.li
                                    key={item.label}
                                    whileHover={{ x: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Link 
                                        href={item.href} 
                                        className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group font-medium tracking-wide"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {item.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Company links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 className="font-serif text-2xl mb-7 text-white font-black tracking-tight uppercase text-sm letter-spacing-wider">Company</h4>
                        <ul className="space-y-3.5 text-sm">
                            {[
                                { label: "About Us", href: "/about" },
                                { label: "Wholesaler Application", href: "/contact" },
                                { label: "Sustainability", href: "/about" },
                                { label: "Contact", href: "/contact" },
                            ].map((item) => (
                                <motion.li
                                    key={item.label}
                                    whileHover={{ x: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Link 
                                        href={item.href} 
                                        className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group font-medium tracking-wide"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {item.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Social & Newsletter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <h4 className="font-serif text-2xl mb-7 text-white font-black tracking-tight uppercase text-sm letter-spacing-wider">Stay Connected</h4>
                        
                        {/* Newsletter */}
                        <div className="mb-7">
                            <p className="text-sm text-white/90 mb-4 font-medium tracking-wide">Get exclusive offers & updates</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="flex-1 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm font-medium tracking-wide"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-7 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-blue-900 font-bold text-sm hover:from-amber-300 hover:to-yellow-400 transition-all tracking-wide shadow-lg shadow-amber-500/50"
                                >
                                    Join
                                </motion.button>
                            </div>
                        </div>

                        {/* Social links */}
                        <div className="flex gap-3">
                            {[
                                { icon: Instagram, href: "#" },
                                { icon: Facebook, href: "#" },
                                { icon: Linkedin, href: "#" },
                            ].map((social, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Link 
                                        href={social.href}
                                        className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-amber-300/30 flex items-center justify-center text-white hover:bg-gradient-to-br hover:from-amber-400 hover:to-yellow-500 hover:text-blue-900 hover:border-amber-400 transition-all shadow-lg hover:shadow-amber-500/50"
                                    >
                                        <social.icon className="h-5 w-5" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="pt-8 border-t border-white/10"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
                        <p className="font-medium tracking-wide">
                            &copy; {new Date().getFullYear()} Carmella. All rights reserved. Crafted with love.
                        </p>
                        <div className="flex gap-6 font-medium">
                            <Link href="#" className="hover:text-white transition-colors tracking-wide">Privacy Policy</Link>
                            <Link href="#" className="hover:text-white transition-colors tracking-wide">Terms of Service</Link>
                            <Link href="#" className="hover:text-white transition-colors tracking-wide">Cookies</Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}
