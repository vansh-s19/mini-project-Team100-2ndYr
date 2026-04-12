"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, Hash, Home, Briefcase, MapPin, Save, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pan: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    occupation: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        pan: (user as any).pan || "",
        address: (user as any).address || "",
        city: (user as any).city || "",
        state: (user as any).state || "",
        pincode: (user as any).pincode || "",
        occupation: (user as any).occupation || "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      toast.success("Profile updated successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile")
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black text-white mb-2">
              {user?.role === "authority" ? "Official Registry Account" : "My Profile"}
            </h1>
            <p className="text-slate-400">
              {user?.role === "authority" 
                ? "Manage your administrative credentials and departmental settings." 
                : "Manage your identity and KYC details for secure property handling."}
            </p>
            {!isLoading && user && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mt-4">
                <div className={`w-2 h-2 rounded-full ${user.name && user.phone && user.pan ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {user.name && user.phone && user.pan ? 'Digital Identity Verified' : 'Action Required: Complete Profile'}
                </span>
              </motion.div>
            )}
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Sidebar info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                <CardContent className="pt-6 text-center">
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/30">
                    <User className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{formData.name}</h3>
                  <p className="text-sm text-emerald-400 font-medium">
                    {user?.role === "authority" ? "Authorized Official" : "Verified Citizen"}
                  </p>
                  
                  <div className="mt-6 pt-6 border-t border-white/5 space-y-4 text-left">
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Smart Contract Ready
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {user?.role === "authority" ? "Registry Access Active" : "IPFS Encryption Active"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    {user?.role === "authority" ? "Authority Settings" : "KYC & Personal Details"}
                  </CardTitle>
                  <CardDescription>
                    {user?.role === "authority" 
                      ? "Professional credentials used for property verification logs." 
                      : "These details are required for legal property verification."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input name="name" value={formData.name} onChange={handleChange} className="bg-slate-950/50 border-white/10 pl-10 h-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input name="email" value={formData.email} disabled className="bg-slate-950/30 border-white/10 pl-10 h-11 text-slate-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input name="phone" value={formData.phone} onChange={handleChange} className="bg-slate-950/50 border-white/10 pl-10 h-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                          {user?.role === "authority" ? "Official Designation" : "Occupation"}
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input name="occupation" value={formData.occupation} onChange={handleChange} className="bg-slate-950/50 border-white/10 pl-10 h-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                          {user?.role === "authority" ? "Department ID" : "PAN Number"}
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input name="pan" value={formData.pan} onChange={handleChange} className="bg-slate-950/50 border-white/10 pl-10 h-11 font-mono uppercase" placeholder={user?.role === "authority" ? "GOV-12345" : "ABCDE1234F"} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                        {user?.role === "authority" ? "Departmental Office Address" : "Permanent Address"}
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input name="address" value={formData.address} onChange={handleChange} className="bg-slate-950/50 border-white/10 pl-10 h-20" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">City</label>
                        <Input name="city" value={formData.city} onChange={handleChange} className="bg-slate-950/50 border-white/10 h-11" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">State</label>
                        <Input name="state" value={formData.state} onChange={handleChange} className="bg-slate-950/50 border-white/10 h-11" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Pincode</label>
                        <Input name="pincode" value={formData.pincode} onChange={handleChange} className="bg-slate-950/50 border-white/10 h-11" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-12 px-8 font-bold gap-2 transition-all shadow-lg shadow-emerald-500/10"
                      >
                        <Save className="w-5 h-5" />
                        {isLoading ? "Saving..." : "Save Profile Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
