"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import dynamic from 'next/dynamic'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion, AnimatePresence } from "framer-motion"
import { Map, LucideIcon, Search, Filter, Layers, List, Sparkles, Home, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Dynamic import for the Map component to avoid SSR errors with Leaflet
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0a0f1e]/60 flex items-center justify-center rounded-3xl animate-pulse backdrop-blur-xl border border-white/10">Loading map data...</div>
})

const BACKEND_URL = "http://localhost:5001"

export default function MapsPage() {
  const [properties, setProperties] = useState([])
  const [filteredProps, setFilteredProps] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/market/properties`)
        setProperties(response.data)
        setFilteredProps(response.data)
      } catch (err) {
        console.error("Mapping Error:", err)
      }
    }
    fetchProps()
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term) {
      setFilteredProps(properties)
      return
    }
    const filtered = properties.filter((p: any) => 
      p.name.toLowerCase().includes(term.toLowerCase()) || 
      p.city.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredProps(filtered)
  }

  return (
    <main className="min-h-screen bg-[#0f1513] text-white overflow-hidden flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 px-4 pb-8 flex flex-col">
        {/* Sub-Header / Controls */}
        <div className="mx-auto max-w-7xl w-full mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-[32px] bg-card/50 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center border border-border">
                <Map className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-black flex items-center gap-2">
                  Global Ledger Map
                  <span className="text-[10px] bg-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-tighter text-white">Live</span>
                </h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Syncing with Ethereum Ledger</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  placeholder="Search City or Property..." 
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-secondary/50 border-border/50 rounded-xl pl-10 focus:border-emerald-500/50 font-mono"
                />
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl border border-border/50 hover:bg-secondary/50">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Map View */}
        <div className="mx-auto max-w-7xl w-full flex-1 flex flex-col md:flex-row gap-6">
          
          {/* Left: Map Container */}
          <motion.div 
            className="flex-[3] relative rounded-[40px] overflow-hidden border border-border/50"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
             <div className="absolute inset-0 bg-[#0f1513]/5 z-10 pointer-events-none" />
            <PropertyMap properties={filteredProps} />
          </motion.div>

          {/* Right: Property Feed Feed Sidebar */}
          <motion.div 
            className="flex-1 flex flex-col gap-4 max-h-[calc(100vh-250px)]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-6 rounded-[40px] bg-card/50 border border-border/50 backdrop-blur-sm flex-1 flex flex-col overflow-hidden">
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <List className="w-3 h-3" />
                Live Registry ({filteredProps.length})
              </h3>
              
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {filteredProps.map((p: any, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-5 rounded-3xl bg-secondary/30 border border-border/50 hover:border-emerald-500/30 hover:bg-secondary transition-all cursor-pointer shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                       <div>
                         <h4 className="text-sm font-black truncate max-w-[120px] text-slate-100 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{p.name || `Property #${i}`}</h4>
                         <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{p.city}</p>
                       </div>
                        <div className="text-right">
                          <span className="text-[11px] text-emerald-400 font-black bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">₹{p.actual_price}L</span>
                          <div className="mt-1 flex items-center gap-1 justify-end">
                            <span className="text-[8px] text-slate-500 uppercase font-bold">AI:</span>
                            <span className="text-[9px] font-black text-slate-300">₹{p.predicted_price}L</span>
                          </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-secondary/50 border border-border">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-400">{p.area} sqft</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-secondary/50 border border-border">
                        <Home className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{p.bedrooms} BHK</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 px-2 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <span className={`text-[9px] font-black ${p.profit_margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {p.profit_margin >= 0 ? '▲' : '▼'} {Math.abs(p.profit_margin)}% Yield
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex -space-x-1.5">
                          {[1,2,3].map(j => (
                            <div key={j} className="w-5 h-5 rounded-full border-2 border-card bg-secondary/80 flex items-center justify-center text-[8px] font-black text-emerald-400 shadow-sm uppercase">
                              {String.fromCharCode(64 + j)}
                            </div>
                          ))}
                       </div>
                       <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-[40px] bg-secondary/30 border border-border/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                  <Sparkles className="w-12 h-12 text-emerald-400" />
                </div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Global Verification</h4>
                <p className="text-[10px] text-emerald-400 mb-3 font-mono">NODE SYNC: 100%</p>
                <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden border border-border">
                  <motion.div 
                    className="h-full bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                  />
                </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </main>
  )
}
