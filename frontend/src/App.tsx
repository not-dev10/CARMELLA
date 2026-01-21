import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { SmoothScroll } from "@/components/smooth-scroll"
import { ToastProvider } from "@/components/ui/toast"
import { BackToTop } from "@/components/ui/back-to-top"
import { ExitIntentPopup } from "@/components/ui/exit-intent-popup"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/layout/header"
import { AnnouncementBar } from "@/components/layout/announcement-bar"
import { Footer } from "@/components/layout/footer"
import Home from "@/pages/Home"
import Catalog from "@/pages/Catalog"
import Category from "@/pages/Category"
import ProductDetail from "@/pages/ProductDetail"
import Checkout from "@/pages/Checkout"
import About from "@/pages/About"
import Contact from "@/pages/Contact"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import AuthCallback from "@/pages/AuthCallback"
import Admin from "@/pages/Admin"

function App() {
  return (
    <ThemeProvider defaultTheme="system" attribute="class" storageKey="vite-ui-theme">
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Routes>
                <Route path="/admin" element={<Admin />} />
                <Route
                  path="*"
                  element={
                    <SmoothScroll>
                      <div className="relative flex min-h-screen flex-col bg-background font-sans antialiased text-foreground">
                        <AnnouncementBar />
                        <Header />
                        <main className="flex-1">
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/catalog" element={<Catalog />} />
                            <Route path="/category/:slug" element={<Category />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route 
                              path="/login" 
                              element={
                                <ProtectedRoute requireGuest>
                                  <Login />
                                </ProtectedRoute>
                              } 
                            />
                            <Route 
                              path="/signup" 
                              element={
                                <ProtectedRoute requireGuest>
                                  <Signup />
                                </ProtectedRoute>
                              } 
                            />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                          </Routes>
                        </main>
                        <Footer />
                        <BackToTop />
                        <ExitIntentPopup />
                      </div>
                    </SmoothScroll>
                  }
                />
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
export default App
