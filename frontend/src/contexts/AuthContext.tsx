import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

  useEffect(() => {
    if (!supabase) {
      return
    }

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session)
      setUser(session?.user ?? null)
    }).catch(() => {
      // Silently fail
    })

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setSession(session)
        setUser(session?.user ?? null)
      })
      return () => subscription?.unsubscribe()
    } catch {
      // Silently fail
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
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading: false, signInWithGoogle, signOut }}>
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
