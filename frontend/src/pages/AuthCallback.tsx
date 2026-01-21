import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (data.session?.user) {
          const user = data.session.user
          
          // Check if this is a Google OAuth user
          const isGoogleUser = user.app_metadata?.providers?.includes('google')
          
          // Check if user already has an email/password account
          if (isGoogleUser) {
            const { data: identities } = await supabase.auth.getUserIdentities()
            
            if (identities && identities.length > 1) {
              // User has multiple auth methods linked
              console.log('Account linked successfully with Google')
            } else if (identities && identities.length === 1) {
              // Only Google auth method
              console.log('Google account authenticated')
            }
          }
          
          // Check if user profile exists in database
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (!userProfile) {
            // Create user profile if it doesn't exist
            await supabase
              .from('users')
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  created_at: new Date().toISOString(),
                }
              ])
          }
          
          // Redirect to home
          navigate('/')
        } else {
          // No session, redirect to login
          navigate('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setError(error instanceof Error ? error.message : 'Authentication failed')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <p className="text-muted-foreground text-sm">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
