"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ShieldCheck, MapPin, Maximize2, ExternalLink, Sparkles, FileText, Share2, Loader2, Wallet } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWeb3 } from "@/context/Web3Context"
import { PropertyDetailsModal } from "@/components/PropertyDetailsModal"

interface UserProperty {
  id: number
  registryId: string
  ownerName: string
  area: string
  location: string
  ipfsHash: string
  status: string
}

const statusConfig = {
  verified: { 
    icon: ShieldCheck, 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/10", 
    border: "border-emerald-500/20",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]"
  },
  pending: { 
    icon: Sparkles, 
    color: "text-amber-400", 
    bg: "bg-amber-500/10", 
    border: "border-amber-500/20",
    glow: ""
  },
  rejected: { 
    icon: ShieldCheck, 
    color: "text-red-400", 
    bg: "bg-red-500/10", 
    border: "border-red-500/20",
    glow: ""
  }
}

export function DashboardPreview() {
  const { contract, account, isConnected } = useWeb3()
  const [properties, setProperties] = useState<UserProperty[]>([])
  const [loading, setLoading] = useState(false)
  
  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<UserProperty | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadProperties = useCallback(async () => {
    if (!contract || !account) return
    setLoading(true)
    try {
      const ids = await contract.getPropertiesByOwner(account)
      const props: UserProperty[] = []
      
      for (const id of ids) {
        try {
          const p = await contract.getProperty(id.toNumber())
          if (p.exists) {
            props.push({
              id: p.id.toNumber(),
              registryId: p.registryId,
              ownerName: p.ownerName,
              area: p.area,
              location: p.propertyAddress,
              ipfsHash: p.ipfsHash,
              status: p.verified ? "verified" : "pending"
            })
          }
        } catch (e) { console.error(e) }
      }
      setProperties(props)
    } catch (error) {
      console.error("Dashboard Load Error:", error)
    } finally {
      setLoading(false)
    }
  }, [contract, account])

  useEffect(() => {
    if (isConnected) {
      loadProperties()
    } else {
      setProperties([])
    }
  }, [isConnected, loadProperties])

  return (
    <section className="relative py-32 bg-[#0f1513] overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-secondary/50 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">Proof of Ownership</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-white leading-[1.1]">
            Your <span className="text-emerald-400">Digital</span> Real Estate <br />Portfolio.
          </h2>
          <p className="max-w-2xl text-slate-500 font-medium">
            Every property you register is anchored as a unique verifiable asset on the Ethereum ledger. Access your deeds anytime, anywhere.
          </p>
        </div>

        {/* Dynamic Content Area */}
        {!isConnected ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center rounded-[40px] border border-white/5 bg-secondary/10 backdrop-blur-xl">
             <Wallet className="w-16 h-16 text-slate-700 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-white mb-2">Wallet Not Connected</h3>
             <p className="text-slate-500 mb-8 max-w-xs mx-auto">Please connect your Web3 wallet to retrieve your decentralized property deeds.</p>
             <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-8 py-6 font-black uppercase tracking-widest text-xs">Unlock Assets</Button>
          </motion.div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3].map(i => <div key={i} className="h-[420px] rounded-[40px] bg-secondary/20 animate-pulse border border-white/5" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center rounded-[40px] border border-white/5 bg-secondary/10 backdrop-blur-xl">
             <FileText className="w-16 h-16 text-slate-700 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-white mb-2">No Deeds Found</h3>
             <p className="text-slate-500 mb-8 max-w-xs mx-auto">You haven&apos;t registered any properties to this wallet address yet.</p>
             <Button asChild className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-8 py-6 font-black uppercase tracking-widest text-xs">
               <a href="/register">Register My First Property</a>
             </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop, i) => {
              const config = statusConfig[prop.status as keyof typeof statusConfig] || statusConfig.pending
              return (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`group relative rounded-[40px] border border-white/5 bg-secondary/20 p-8 backdrop-blur-xl transition-all hover:border-emerald-500/30 ${config.glow}`}
                >
                  {/* Prestige Seal Overlay */}
                  {prop.status === 'verified' && (
                    <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldCheck className="w-24 h-24 text-emerald-400 rotate-12" />
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border}`}>
                        <config.icon className={`w-3 h-3 ${config.color}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{prop.status}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400 font-mono">#{prop.id}</span>
                        <p className="text-[8px] text-slate-500 uppercase font-bold">Ledger ID</p>
                      </div>
                    </div>

                    {/* Property Identity */}
                    <div className="mb-8">
                      <h3 className="text-2xl font-black text-white mb-2 truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{prop.location}</h3>
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-1.5 w-fit border border-white/5">
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-400">{prop.registryId}</span>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="space-y-1">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Dimension</p>
                        <div className="flex items-center gap-2">
                           <Maximize2 className="w-4 h-4 text-emerald-400/50" />
                           <span className="text-xs font-bold text-slate-300">{prop.area} SQFT</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Ownership</p>
                        <div className="flex items-center gap-2">
                           <MapPin className="w-4 h-4 text-emerald-400/50" />
                           <span className="text-xs font-bold text-slate-300 truncate w-24">Digital Asset</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex gap-2">
                         <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl border border-white/5 hover:bg-secondary/80">
                           <Share2 className="w-4 h-4 text-slate-400" />
                         </Button>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setSelectedProperty(prop); setIsModalOpen(true); }}
                            className="w-10 h-10 rounded-xl border border-white/5 hover:bg-secondary/80"
                          >
                           <Eye className="w-4 h-4 text-slate-400" />
                         </Button>
                      </div>
                      <Button onClick={() => { setSelectedProperty(prop); setIsModalOpen(true); }} className="rounded-xl bg-white text-black hover:bg-emerald-400 hover:text-white transition-all font-black text-xs gap-2 px-6">
                        View Deed <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* View All CTA */}
        <div className="mt-16 text-center">
           <Button variant="ghost" asChild className="text-[10px] font-black uppercase tracking-[.4em] text-slate-500 hover:text-emerald-400 transition-all">
             <a href="/profile">Explore Full Global Registry <span className="ml-2">→</span></a>
           </Button>
        </div>
      </div>

      <PropertyDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={selectedProperty?.id || 0}
        registryId={selectedProperty?.registryId || ""}
        ipfsHash={selectedProperty?.ipfsHash || ""}
        ownerName={selectedProperty?.ownerName || ""}
      />
    </section>
  )
}
