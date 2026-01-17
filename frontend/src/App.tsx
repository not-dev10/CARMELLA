import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { SmoothScroll } from "@/components/smooth-scroll"
import { ToastProvider } from "@/components/ui/toast"
import { BackToTop } from "@/components/ui/back-to-top"
import { ExitIntentPopup } from "@/components/ui/exit-intent-popup"
import { Header } from "@/components/layout/header"
import { AnnouncementBar } from "@/components/layout/announcement-bar"
import { Footer } from "@/components/layout/footer"
import Home from "@/pages/Home"
import Catalog from "@/pages/Catalog"
import ProductDetail from "@/pages/ProductDetail"
import About from "@/pages/About"
import Contact from "@/pages/Contact"

function App() {
  return (
    <ThemeProvider defaultTheme="system" attribute="class" storageKey="vite-ui-theme">
      <ToastProvider>
        <Router>
          <SmoothScroll>
            <div className="relative flex min-h-screen flex-col bg-background font-sans antialiased text-foreground">
              <AnnouncementBar />
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </main>
              <Footer />
              <BackToTop />
              <ExitIntentPopup />
            </div>
          </SmoothScroll>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  )
}
export default App
