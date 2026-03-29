import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cache } from '@/lib/cache'

interface AuthContextType {
  user: any
  session: any
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from database when session changes
  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      try {
        // Use Supabase to read the user profile
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (!error && data) {
          setUser(data)
        } else {
          // If profile fetch fails, still show the auth user
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session)
      if (session?.user?.id) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    }).catch(() => {
      setLoading(false)
    })

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        setSession(session)
        
        // ✅ Only clear pricing caches on actual login/logout, not token refresh
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          console.log('[AUTH] Auth event:', event, '- Clearing pricing caches');
          cache.clear('featured_products');
          cache.clear('products_');
        } else {
          console.log('[AUTH] Auth event:', event, '- Skipping cache clear (token refresh)');
        }
        
        if (session?.user?.id) {
          fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      })
      return () => subscription?.unsubscribe()
    } catch {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
      // Clear all caches on sign out
      cache.clearAll()
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
