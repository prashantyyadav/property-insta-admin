import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing Supabase session on mount
    const initAuth = async () => {
      try {
        if (!supabase) {
          // No Supabase configured — fall back to localStorage mock user
          const stored = localStorage.getItem('admin_user')
          if (stored) {
            setUser(JSON.parse(stored))
          }
          setLoading(false)
          return
        }

        // Try to restore Supabase session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email,
            email: session.user.email,
            role: 'admin',
            avatar: session.user.user_metadata?.avatar || null,
          })
        } else {
          // No Supabase session — check localStorage fallback
          const stored = localStorage.getItem('admin_user')
          if (stored) {
            setUser(JSON.parse(stored))
          }
        }
      } catch (err) {
        console.warn('Auth init error:', err)
        // Fallback to localStorage
        const stored = localStorage.getItem('admin_user')
        if (stored) {
          setUser(JSON.parse(stored))
        }
      }
      setLoading(false)
    }

    initAuth()

    // Listen for auth state changes from Supabase
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email,
            email: session.user.email,
            role: 'admin',
            avatar: session.user.user_metadata?.avatar || null,
          }
          setUser(userData)
          localStorage.setItem('admin_user', JSON.stringify(userData))
        } else {
          setUser(null)
          localStorage.removeItem('admin_user')
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  const login = async (email, password) => {
    // Try Supabase auth first
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          // If Supabase auth fails, fall back to mock login
          console.warn('Supabase auth failed, trying mock login:', error.message)
          if (email === 'admin@example.com' && password === 'admin123') {
            const userData = {
              id: 1,
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin',
              avatar: null,
            }
            setUser(userData)
            localStorage.setItem('admin_user', JSON.stringify(userData))
            return { success: true, warning: 'Logged in with demo credentials. Real Supabase writes will use RLS bypass.' }
          }
          return { success: false, error: error.message }
        }

        // Supabase auth succeeded
        const userData = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email,
          email: data.user.email,
          role: 'admin',
          avatar: data.user.user_metadata?.avatar || null,
        }
        setUser(userData)
        localStorage.setItem('admin_user', JSON.stringify(userData))
        return { success: true }
      } catch (err) {
        console.warn('Supabase auth error:', err)
      }
    }

    // Mock fallback (no Supabase OR Supabase failed with catch)
    if (email === 'admin@example.com' && password === 'admin123') {
      const userData = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        avatar: null,
      }
      setUser(userData)
      localStorage.setItem('admin_user', JSON.stringify(userData))
      return { success: true, warning: 'Logged in with demo credentials. Supabase writes may not work. Create a user in Supabase Auth dashboard.' }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase signOut error:', err)
      }
    }
    setUser(null)
    localStorage.removeItem('admin_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}