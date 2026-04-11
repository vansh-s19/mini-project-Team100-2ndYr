"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

  useEffect(() => {
    async function handleAuth() {
      if (token) {
        try {
          // 1. Store token
          localStorage.setItem("token", token)
          
          // 2. Fetch user data to verify and store profile
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          if (res.ok) {
            const data = await res.json()
            localStorage.setItem("user", JSON.stringify(data.user))
            
            // Force reload or just push to home (reload ensures context picks up new storage)
            window.location.href = "/"
          } else {
            console.error("Failed to fetch user after Google OAuth")
            router.push("/auth?error=oauth_failed")
          }
        } catch (err) {
          console.error("Auth callback error:", err)
          router.push("/auth?error=internal_error")
        }
      } else {
        router.push("/auth")
      }
    }
    
    handleAuth()
  }, [token, router, API_URL])

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-[64px] rounded-full" />
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin relative z-10" />
      </div>
      <p className="text-slate-400 font-medium animate-pulse">Finalizing secure connection...</p>
    </div>
  )
}
