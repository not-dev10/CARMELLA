import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean // If true, requires user to be logged in
  requireGuest?: boolean // If true, requires user to be logged out
}

export function ProtectedRoute({ 
  children, 
  requireAuth = false, 
  requireGuest = false 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If route requires guest (login/signup pages) but user is logged in, redirect to home
  if (requireGuest && user) {
    return <Navigate to="/" replace />
  }

  // If route requires auth but user is not logged in, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
