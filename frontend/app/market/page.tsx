"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, DollarSign, Locate, Home, Building2, Layers, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { useWeb3 } from "@/context/Web3Context"

const BACKEND_URL = "http://localhost:5001"

export default function MarketAnalysisPage() {
  const { contract } = useWeb3()
  const [marketProperties, setMarketProperties] = useState<any[]>([])
  const [loadingMarket, setLoadingMarket] = useState(false)
  
  useEffect(() => {
    const fetchMarket = async () => {
        setLoadingMarket(true)
        try {
            // Priority 1: Smart ML Dataset
            const res = await axios.get(`${BACKEND_URL}/api/market/properties`)
            if (res.data && res.data.length > 0) {
              setMarketProperties(res.data.slice(0, 12))
              setLoadingMarket(false)
              return
            }
        } catch (e) {
            console.warn("ML Market fetch failed, falling back to blockchain registry...", e)
        }

        // Priority 2: Live Blockchain Registry (Fallback)
        if (contract) {
          try {
            const count = await contract.getPropertyCount()
            const total = count.toNumber()
            const props = []
            // Fetch last 12 properties
            for (let i = total; i > Math.max(0, total - 12); i--) {
              try {
                const p = await contract.getProperty(i)
                if (p.exists) {
                  props.push({
                    name: p.ownerName,
                    city: p.propertyAddress.split(",")[0],
                    area: p.area,
                    bedrooms: 3, // Default for viz
                    isBlockchain: true,
                    registryId: p.registryId
                  })
                }
              } catch (e) { /* skip */ }
            }
            setMarketProperties(props)
          } catch (err) {
            console.error("Blockchain fallback failed:", err)
          }
        }
        setLoadingMarket(false)
    }
    fetchMarket()
  }, [contract])

  return (
    <main className="min-h-screen bg-[#0f1513] text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute -top-24 -left-24 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              Global Ledger Registry
            </div>
            <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight">
              Real Estate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Marketplace.</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Explore and invest in verified property assets secured by the LandChain decentralized ledger. High-yield opportunities verified by algorithmic market intelligence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-12 border-b border-border/30 pb-8">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Listings.</span></h2>
              <p className="text-slate-400 text-sm">Recently anchored properties available for secondary market exchange.</p>
            </div>
            <Button variant="outline" className="rounded-2xl border-border/50 hover:bg-white/5 px-6 group">
              Explore All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {loadingMarket ? (
              Array(8).fill(0).map((_, i) => <div key={i} className="h-[400px] rounded-[40px] bg-secondary/20 animate-pulse border border-border/50" />)
            ) : marketProperties.map((p: any, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="group bg-card/50 backdrop-blur-md border-border/50 hover:border-emerald-500/40 transition-all duration-500 rounded-[40px] overflow-hidden border">
                  <div className="h-48 bg-secondary/50 relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800')] opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
                     <div className="absolute top-4 right-4 px-3 py-1 bg-[#0f1513]/80 backdrop-blur-md rounded-full border border-border text-[10px] font-black uppercase tracking-widest text-emerald-400">Verified Asset</div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-bold mb-1 truncate">{p.name || "Modern Estate"}</h4>
                    <div className="flex items-center gap-2 mb-4">
                      <Locate className="w-3 h-3 text-emerald-500" />
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{p.city}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                       <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/30 border border-border/50">
                          <Layers className="w-3 h-3 text-emerald-400/60" />
                          <span className="text-[10px] font-bold text-slate-300">{p.area} sqft</span>
                       </div>
                       <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/30 border border-border/50">
                          <Home className="w-3 h-3 text-emerald-400/60" />
                          <span className="text-[10px] font-bold text-slate-300">{p.bedrooms} BHK</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mb-0.5">Anchored Value</p>
                        <p className="text-2xl font-black text-emerald-400">₹{(p.area * 5000 / 100000).toFixed(1)}L</p>
                      </div>
                      <Button size="icon" className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
