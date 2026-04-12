"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Home, Building2, MapPin, X, ChevronDown, Star,
  Sparkles, ArrowRight, Eye, Layers, Filter,
  Map as LucideMap
} from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"
import { ethers } from "ethers"

interface PropertyData {
  ownerName: string
  bhk: string
  sqft: number
  status: string
  propertyName: string
  address: string
  city: string
  furnished: string
  type: string
  pricePerSqft: number
  lat: number
  lng: number
  category: string
  source: string
}

const CITIES = ["All", "Mumbai", "Delhi", "Gurgaon", "Bengaluru", "Hyderabad", "Pune", "Noida", "Jaipur", "Lucknow", "Ahmedabad", "Chandigarh"] as const

export default function MarketPage() {
  const router = useRouter()
  const { contract } = useWeb3()
  
  const [mode, setMode] = useState<"Buying" | "Rental">("Buying")
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState<string>("All")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [blockchainProperties, setBlockchainProperties] = useState<PropertyData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRegistry, setLoadingRegistry] = useState(false)

  // ── Database Fetching ──
  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true)
      try {
        const res = await fetch("http://localhost:5001/api/market/properties")
        const data = await res.json()
        if (Array.isArray(data)) setProperties(data)
      } catch (err) {
        console.error("API Fetch failed:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProps()
  }, [])

  // ── Blockchain Synchronization ──
  useEffect(() => {
    const fetchFromRegistry = async () => {
      if (!contract) return
      setLoadingRegistry(true)
      try {
        const count = await contract.getPropertyCount()
        const total = count.toNumber()
        const props: PropertyData[] = []
        
        for (let i = total; i > Math.max(0, total - 12); i--) {
          try {
            const p = await contract.getProperty(i)
            if (p.exists) {
              props.push({
                ownerName: p.ownerNames,
                propertyName: `Asset #${p.registryId}`,
                address: p.propertyAddress,
                city: p.propertyAddress.split(",")[0].trim() || "Local",
                sqft: p.area,
                bhk: "3 BHK",
                status: "Ready to Move",
                furnished: "Furnished",
                type: "Apartment",
                pricePerSqft: 5000,
                lat: 23.0225 + (Math.random() - 0.5) * 2,
                lng: 72.5714 + (Math.random() - 0.5) * 2,
                category: "Buying",
                source: "real",
                imageUrl: "/public/property-images/prop-1.avif"
              })
            }
          } catch (e) { /* skip */ }
        }
        setBlockchainProperties(props)
      } catch (err) {
        console.error("Ledger sync failed:", err)
      } finally {
        setLoadingRegistry(false)
      }
    }
    fetchFromRegistry()
  }, [contract])

  const allProperties = useMemo(() => {
    return [...properties, ...blockchainProperties]
  }, [properties, blockchainProperties])

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      const modeMatch = p.category === (mode === "Buying" ? "Buying" : "Rental")
      const cityMatch = cityFilter === "All" || p.city === cityFilter
      const searchMatch = !searchTerm || [
        p.propertyName, p.city, p.address, p.ownerName, p.type
      ].some(val => val && val.toLowerCase().includes(searchTerm.toLowerCase()))
      
      return modeMatch && cityMatch && searchMatch
    })
  }, [allProperties, mode, searchTerm, cityFilter])

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
    return `₹${price.toLocaleString("en-IN")}`
  }

  const PROPERTY_PHOTOS = [
    '/property-images/prop-1.avif',
    '/property-images/prop-2.avif',
    '/property-images/prop-3.avif',
    '/property-images/prop-4.avif',
    '/property-images/prop-5.avif',
    '/property-images/prop-6.avif',
    '/property-images/prop-7.avif',
    '/property-images/prop-8.avif',
    '/property-images/prop-9.avif',
    '/property-images/prop-10.jpg',
    '/property-images/prop-11.png',
  ]

  const getPropertyImage = (p: PropertyData, index: number) => {
    return PROPERTY_PHOTOS[index % PROPERTY_PHOTOS.length]
  }

  const handleViewOnMap = (p: PropertyData) => {
    router.push(`/maps?lat=${p.lat}&lng=${p.lng}&name=${encodeURIComponent(p.propertyName)}`)
  }

  return (
    <main className="min-h-screen bg-[#0f1513] text-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute -top-24 -left-24 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] -z-10" />

        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              {loadingRegistry ? "Syncing Ledger..." : "Global Ledger Registry"}
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

      {/* Control Bar */}
      <section className="sticky top-20 z-40 bg-[#0f1513]/80 backdrop-blur-xl border-y border-white/5 py-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Mode Toggle */}
            <div className="flex bg-secondary/30 p-1 rounded-2xl border border-border/50 self-start md:self-auto">
              {(["Buying", "Rental"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {m === "Buying" ? "Sale" : "Rent"}
                </button>
              ))}
            </div>

            {/* Search + City */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative">
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="h-11 px-4 bg-secondary/50 border border-border/30 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-secondary/70 transition-all min-w-[140px]"
                >
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">{cityFilter === "All" ? "Everywhere" : cityFilter}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${showCityDropdown ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {showCityDropdown && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-48 bg-[#1a211e] border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                      {CITIES.map((city) => (
                        <button key={city} onClick={() => { setCityFilter(city); setShowCityDropdown(false) }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${cityFilter === city ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 hover:bg-white/5"}`}>{city}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search and Filter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-9 py-2.5 text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                />
                {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Grid */}
      <section className="pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-1">
                Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Listings.</span>
              </h2>
              <p className="text-slate-500 text-sm">{filteredProperties.length} active assets • {blockchainProperties.length} anchored on-chain</p>
            </div>
            <Button variant="outline" className="rounded-2xl border-border/50 hover:bg-white/5 px-5 group text-sm" onClick={() => router.push('/maps')}>
              <LucideMap className="w-4 h-4 mr-2" /> View Layout <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProperties.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <Search className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-lg font-semibold text-slate-500">No matches in the current ledger</p>
                <p className="text-sm text-slate-600">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredProperties.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.4) }}>
                  <div className="group bg-card/50 border border-border/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5">
                    <div className="h-44 bg-secondary/30 relative overflow-hidden">
                      <img src={getPropertyImage(p, i)} alt={p.propertyName} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {p.source === 'real' && <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Verified</span>}
                        <span className={`px-2.5 py-1 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-wider text-white ${p.category === 'Buying' ? 'bg-emerald-600/80' : 'bg-blue-600/80'}`}>{p.category === 'Buying' ? 'Sale' : 'Rent'}</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-[15px] text-white truncate mb-1 group-hover:text-emerald-400 transition-colors">{p.propertyName}</h3>
                      <div className="flex items-center gap-1.5 mb-4">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">{p.city}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-secondary/60 border border-border/80 text-slate-400">{p.bhk}</span>
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-secondary/60 border border-border/80 text-slate-400">{p.sqft.toLocaleString()} sqft</span>
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-secondary/60 border border-border/80 text-slate-400">{p.type}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">{p.category === 'Buying' ? 'Price' : 'Annual Rent'}</p>
                          <p className="text-xl font-black text-emerald-400">{formatPrice(p.sqft * p.pricePerSqft)}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleViewOnMap(p) }} className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-emerald-500/20">
                          <LucideMap className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
