import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "@/components/ui/link-shim"
import { supabase } from "@/lib/supabase"
import { ModeToggle } from "@/components/ui/mode-toggle"

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!supabase) {
        setError("Supabase not configured")
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message || "Invalid email or password")
        return
      }

      if (!data.session) {
        setError("Login failed - no session created")
        return
      }

      // Redirect to admin panel
      navigate("/admin")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-card dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-900/50 border border-border dark:border-gray-800 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-serif text-4xl font-bold text-foreground">Carmella</h1>
            <p className="text-muted-foreground font-medium">Admin Dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">{error}</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Make sure your account has admin privileges
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-border dark:border-gray-800 rounded-lg bg-background dark:bg-gray-800 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-border dark:border-gray-800 rounded-lg bg-background dark:bg-gray-800 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Admin"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card dark:bg-gray-900 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Back to Home */}
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-xs text-blue-900 dark:text-blue-200">
              <span className="font-semibold">Admin Access Required:</span> Only users with admin privileges can access this dashboard. Contact your system administrator if you need access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
