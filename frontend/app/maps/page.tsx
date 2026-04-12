"use client"

import { useState, useMemo, useRef, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Layers, Home, Building2, MapPin, X, ChevronDown,
  Star, Map as LucideMap
} from "lucide-react"
import type { PropertyData } from "@/components/PropertyMap"

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-800 flex items-center justify-center rounded-2xl animate-pulse">
      <span className="text-slate-500 text-sm font-medium">Loading map…</span>
    </div>
  ),
})

const CITIES = ["All", "Mumbai", "Delhi", "Gurgaon", "Bengaluru", "Hyderabad", "Pune", "Noida", "Jaipur", "Lucknow", "Ahmedabad", "Chandigarh"] as const

export default function MapsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1513]" />}>
      <MapsPage />
    </Suspense>
  )
}

function MapsPage() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<"Buying" | "Rental">("Buying")
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState<string>("All")
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null)
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [allProperties, setAllProperties] = useState<PropertyData[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch properties from DB
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/market/properties")
        const data = await res.json()
        if (Array.isArray(data)) setAllProperties(data)
      } catch (err) {
        console.error("Map fetch failed:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProps()
  }, [])

  // Auto-select property from URL params (from /market card click)
  useEffect(() => {
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const name = searchParams.get('name')
    if (lat && lng) {
      const found = allProperties.find(p =>
        p.lat?.toString().slice(0, 6) === lat?.slice(0, 6) &&
        p.lng?.toString().slice(0, 6) === lng?.slice(0, 6)
      )
      if (found) {
        setSelectedProperty(found)
        setMode(found.category === "Buying" ? "Buying" : "Rental")
      }
    }
  }, [searchParams, allProperties])

  // Filter logic
  const filteredProperties = useMemo(() => {
    return allProperties.filter(p => {
      const matchesSearch =
        (p.propertyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.city || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesMode = p.category === (mode === "Buying" ? "Buying" : "Rental")
      const matchesCity = cityFilter === "All" || p.city === cityFilter
      return matchesSearch && matchesMode && matchesCity
    })
  }, [searchTerm, mode, cityFilter, allProperties])

  const propKey = (p: PropertyData) => `${p.propertyName}-${p.lat}-${p.lng}`

  const handleSelectFromMap = (p: PropertyData) => {
    setSelectedProperty(p)
    const key = propKey(p)
    const element = cardRefs.current.get(key)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleSelectFromCard = (p: PropertyData) => {
    setSelectedProperty(p)
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
    return `₹${price.toLocaleString('en-IN')}`
  }

  return (
    <main className="min-h-screen bg-[#0f1513] text-slate-100 flex flex-col overflow-hidden h-screen font-sans">
      <Header />

      <div className="flex-1 flex flex-col px-4 pb-4 pt-24 min-h-0">
        {/* ── Top Bar ── */}
        <div className="mx-auto max-w-[1440px] w-full mb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Mode Switcher */}
            <div className="flex bg-secondary/50 p-1.5 rounded-2xl border border-border/50">
              <button
                onClick={() => setMode("Buying")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "Buying" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                Buy
              </button>
              <button
                onClick={() => setMode("Rental")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "Rental" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                Rent
              </button>
            </div>

            {/* Search & City Filter */}
            <div className="flex-1 flex gap-3 w-full md:max-w-2xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search properties, areas, or cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 bg-secondary/30 border border-border/50 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                />
              </div>

              {/* City Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="h-12 px-5 bg-secondary/30 border border-border/50 rounded-2xl text-xs font-bold flex items-center gap-3 hover:bg-secondary/50 transition-all min-w-[140px]"
                >
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">{cityFilter === "All" ? "Everywhere" : cityFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showCityDropdown ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showCityDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-card border border-border/50 rounded-2xl shadow-2xl z-[100] overflow-hidden py-1.5 backdrop-blur-xl"
                    >
                      {CITIES.map((city) => (
                        <button
                          key={city}
                          onClick={() => { setCityFilter(city); setShowCityDropdown(false) }}
                          className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${cityFilter === city ? "text-emerald-400 bg-emerald-500/10" : "text-slate-300 hover:bg-secondary/50"}`}
                        >
                          {city === "All" ? "🌍 All" : `📍 ${city}`}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="mx-auto max-w-[1440px] w-full flex-1 flex flex-col min-h-0">

          {/* === MAP VIEW === */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
              {/* Map */}
              <div className="flex-[3] relative rounded-2xl overflow-hidden min-h-[500px] lg:min-h-0">
                <PropertyMap
                  properties={filteredProperties}
                  selectedProperty={selectedProperty}
                  onSelectProperty={handleSelectFromMap}
                />
              </div>

              {/* Sidebar */}
              <div className="flex-1 flex flex-col gap-3 lg:max-h-[calc(100vh-210px)] lg:min-w-[310px] lg:max-w-[370px]">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Visible", val: filteredProperties.length },
                    { label: "Real", val: filteredProperties.filter(p => p.source === "real").length },
                    { label: "Cities", val: new Set(filteredProperties.map(p => p.city)).size },
                  ].map(s => (
                    <div key={s.label} className="bg-card/50 rounded-xl p-3 border border-border/50">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{s.label}</p>
                      <p className="text-lg font-black text-white">{s.val}</p>
                    </div>
                  ))}
                </div>

                {/* List header */}
                <div className="bg-card/50 rounded-2xl border border-border/50 flex-1 flex flex-col overflow-hidden">
                  <div className="p-3.5 border-b border-border/50">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" />
                      {mode === "Buying" ? "For Sale" : "For Rent"}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${mode === "Buying" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                        {filteredProperties.length}
                      </span>
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2 sidebar-scroll">
                    {filteredProperties.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-14 text-center">
                        <Search className="w-6 h-6 text-slate-600 mb-3" />
                        <p className="text-sm font-semibold text-slate-500">No properties found</p>
                      </div>
                    ) : (
                      filteredProperties.map((p, i) => {
                        const key = propKey(p)
                        const isSelected = selectedProperty && propKey(selectedProperty) === key
                        return (
                          <div
                            key={`${key}-${i}`}
                            ref={(el) => { if (el) cardRefs.current.set(key, el) }}
                            onClick={() => handleSelectFromCard(p)}
                            className={`group p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? mode === "Buying"
                                  ? "bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                                  : "bg-blue-500/10 border-blue-500/30 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20"
                                : "bg-secondary/30 border-border/50 hover:bg-secondary/60 hover:border-border"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="min-w-0 flex-1 mr-2">
                                <div className="flex items-center gap-1.5">
                                  {p.source === 'real' && <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                                  <h4 className="text-[13px] font-bold text-slate-100 truncate">{p.propertyName}</h4>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium truncate">{p.address}, {p.city}</p>
                              </div>
                              <span className={`text-xs font-extrabold whitespace-nowrap ${mode === "Buying" ? "text-emerald-400" : "text-blue-400"}`}>
                                {formatPrice(p.sqft * p.pricePerSqft)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {[p.bhk, `${p.sqft.toLocaleString()} sqft`, p.type].map((t, j) => (
                                <span key={j} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-secondary/50 border border-border/80 text-slate-400">{t}</span>
                              ))}
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${p.status === "Ready to Move" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                                {p.status === "Ready to Move" ? "✓ Ready" : "🔨 Building"}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-card/50 rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
                      <span className="text-[10px] font-semibold text-slate-400">Real (Buy)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40" />
                      <span className="text-[10px] font-semibold text-slate-400">Real (Rent)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                      <span className="text-[10px] font-semibold text-slate-500">Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.15); border-radius: 10px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.3); }
      `}</style>
    </main>
  )
}
