"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Chrome, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("user")
  const [error, setError] = useState("")
  const { login, register, googleLogin, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(name, email, password, role)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-[#0f172a]/50 backdrop-blur-2xl border-white/10 p-8 rounded-[32px] shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              LandChain <span className="text-emerald-400">Secure</span>
            </h1>
            <p className="text-slate-400 text-sm">
              {isLogin ? "Welcome back! Access your property safe." : "Create your decentralized real estate identity."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
            {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 mb-4"
                >
                  {/* Role Selector */}
                  <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setRole("user")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        role === "user" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:text-white"
                      }`}
                    >
                      Citizen / User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("authority")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        role === "authority" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:text-white"
                      }`}
                    >
                      Gov Authority
                    </button>
                  </div>

                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-900/50 border-white/10 pl-10 h-12 rounded-xl"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-white/10 pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-white/10 pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center font-medium bg-red-400/10 p-2 rounded-lg">
                {error}
              </motion.p>
            )}

            <Button
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 group overflow-hidden relative"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <span className="flex items-center justify-center gap-2">
                {isLogin ? "Sign In" : "Get Started"}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0f172a] px-4 text-slate-500 font-bold">Or continue with</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={googleLogin}
              className="flex-1 h-12 rounded-xl border-white/10 bg-slate-900/50 hover:bg-slate-800 hover:border-emerald-500/30 transition-all font-bold gap-2 text-white"
            >
              <Chrome className="w-4 h-4" />
              Continue with Google Account
            </Button>
          </div>

          <p className="text-center mt-8 text-slate-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already a member?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-400 font-bold hover:underline underline-offset-4"
            >
              {isLogin ? "Create account" : "Log in now"}
            </button>
          </p>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-6 text-slate-500">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            Gemini AI Judge
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <ShieldCheck className="w-3 h-3" />
            IPFS Encryption
          </div>
        </div>
      </motion.div>
    </div>
  )
}
