"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  phone?: string
  pan?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  occupation?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  logout: () => void
  googleLogin: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on init AND fetch latest from DB
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      
      // Fetch latest profile to ensure sync (handles cases where token exists but profile was updated elsewhere)
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
        }
      })
      .catch(err => console.error("Failed to sync profile:", err))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data.message ? `${data.error}: ${data.message}` : (data.error || "Login failed")
        throw new Error(errorMsg)
      }

      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      router.push("/")
    } catch (err: any) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data.message ? `${data.error}: ${data.message}` : (data.error || "Registration failed")
        throw new Error(errorMsg)
      }

      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      router.push("/")
    } catch (err: any) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Update failed")

      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))
    } catch (err: any) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/auth")
  }, [router])

  const googleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    updateProfile,
    logout,
    googleLogin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
