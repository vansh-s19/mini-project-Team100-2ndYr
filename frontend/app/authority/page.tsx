"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Users,
  AlertCircle
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/context/Web3Context"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { PropertyDetailsModal } from "@/components/PropertyDetailsModal"

interface Property {
  id: number
  ownerName: string
  owner: string
  registryId: string
  area: string
  propertyAddress: string
  ipfsHash: string
  verified: boolean
  exists: boolean
}

export default function AuthorityDashboard() {
  const { contract, account } = useWeb3()
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"pending" | "verified" | "rejected" | "all">("pending")
  const [isAuthority, setIsAuthority] = useState(false)
  
  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadProperties = useCallback(async () => {
    if (!contract) return
    setLoading(true)
    try {
      const count = await contract.getPropertyCount()
      const props: Property[] = []

      for (let i = 1; i <= count.toNumber(); i++) {
        try {
          const prop = await contract.getProperty(i)
          props.push({
            id: prop.id.toNumber(),
            ownerName: prop.ownerName,
            owner: prop.owner,
            registryId: prop.registryId,
            area: prop.area,
            propertyAddress: prop.propertyAddress,
            ipfsHash: prop.ipfsHash,
            verified: prop.verified,
            exists: prop.exists,
          })
        } catch (e) {
          console.error(`Error loading property ${i}`, e)
        }
      }
      setProperties(props)
    } catch (error) {
      console.error("Error loading registry:", error)
      toast.error("Failed to load property registry from blockchain")
    } finally {
      setLoading(false)
    }
  }, [contract])

  useEffect(() => {
    loadProperties()
    // Verify if current user is the blockchain authority address
    async function checkAuthority() {
      if (contract && account) {
        const govAuth = await contract.governmentAuthority()
        setIsAuthority(govAuth.toLowerCase() === account.toLowerCase())
      }
    }
    checkAuthority()
  }, [contract, account, loadProperties])

  const handleVerify = async (id: number) => {
    if (!contract) return
    try {
      const tx = await contract.verifyProperty(id)
      toast.info("Verification transaction submitted...")
      await tx.wait()
      toast.success("Property verified on blockchain!")
      loadProperties()
    } catch (err: any) {
      toast.error(err.reason || "Verification failed")
    }
  }

  const handleReject = async (id: number) => {
    if (!contract) return
    try {
      const tx = await contract.rejectProperty(id)
      toast.info("Rejection transaction submitted...")
      await tx.wait()
      toast.success("Property rejected on blockchain")
      loadProperties()
    } catch (err: any) {
      toast.error(err.reason || "Rejection failed")
    }
  }

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.registryId.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === "all") return matchesSearch
    if (filter === "pending") return matchesSearch && !p.verified && p.exists
    if (filter === "verified") return matchesSearch && p.verified
    if (filter === "rejected") return matchesSearch && !p.exists
    return matchesSearch
  })

  const stats = {
    pending: properties.filter(p => !p.verified && p.exists).length,
    verified: properties.filter(p => p.verified).length,
    rejected: properties.filter(p => !p.exists).length,
    total: properties.length
  }

  if (user?.role !== "authority" && !isAuthority) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Header />
        <Card className="max-w-md bg-slate-900 border-white/10 text-center p-8">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">Only authorized government officials can access this dashboard.</p>
          <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-500 rounded-xl">
            <a href="/">Return Home</a>
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-5xl font-black text-white tracking-tight mb-3">
                Authority <span className="text-emerald-500">Dashboard</span>
              </h1>
              <p className="text-slate-400 text-lg">Official property registration & verification suite.</p>
            </motion.div>

            <div className="flex gap-4">
              <div className="bg-slate-900/50 border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-500">Blockchain ID</p>
                  <p className="text-xs font-mono text-white">Authority Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
              { label: "Verified", value: stats.verified, icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
              { label: "Rejected", value: stats.rejected, icon: ShieldAlert, color: "text-red-400", bg: "bg-red-400/10" },
              { label: "Total Registers", value: stats.total, icon: Building2, color: "text-blue-400", bg: "bg-blue-400/10" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl hover:bg-slate-900/80 transition-all border-b-2 border-b-white/5">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-3xl font-black text-white mt-1">{stat.value}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Table Suite */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-8">
              <div>
                <CardTitle className="text-2xl font-bold text-white">Verification Queue</CardTitle>
                <CardDescription className="text-slate-400">Review and authorize pending property registrations.</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    placeholder="Search by ID or Registry..." 
                    className="bg-slate-950/50 border-white/10 pl-10 h-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex bg-slate-950/50 border border-white/10 p-1 rounded-xl">
                  {["pending", "verified", "all"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-tighter ${
                        filter === f ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">ID</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Owner & Registry ID</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Physical Address</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Status</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-20">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-slate-500 font-medium">Syncing with Ethereum Ledger...</p>
                          </td>
                        </tr>
                      ) : filteredProperties.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-20">
                            <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No properties found in this category.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredProperties.map((prop) => (
                          <motion.tr 
                            key={prop.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-6 font-mono font-bold text-emerald-500">#{prop.id}</td>
                            <td className="px-6 py-6">
                              <div className="flex flex-col">
                                <span className="text-white font-bold">{prop.ownerName}</span>
                                <span className="text-xs text-slate-500 font-mono">{prop.registryId}</span>
                              </div>
                            </td>
                            <td className="px-6 py-6 text-sm text-slate-400">{prop.propertyAddress}</td>
                            <td className="px-6 py-6">
                              {!prop.exists ? (
                                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 uppercase text-[10px] font-black tracking-widest">Rejected</Badge>
                              ) : prop.verified ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[10px] font-black tracking-widest">Verified</Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase text-[10px] font-black tracking-widest">Pending</Badge>
                              )}
                            </td>
                            <td className="px-6 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
                                    setSelectedProperty(prop)
                                    setIsModalOpen(true)
                                  }}
                                  className="hover:bg-blue-500/10 hover:text-blue-400"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {prop.exists && !prop.verified && (
                                  <>
                                    <Button 
                                      onClick={() => handleVerify(prop.id)}
                                      className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl h-9 px-4 font-bold text-xs"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Verify
                                    </Button>
                                    <Button 
                                      onClick={() => handleReject(prop.id)}
                                      className="bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 rounded-xl h-9 px-4 font-bold text-xs"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <PropertyDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={selectedProperty?.id || 0}
        registryId={selectedProperty?.registryId || ""}
        ipfsHash={selectedProperty?.ipfsHash || ""}
        ownerName={selectedProperty?.ownerName || ""}
      />

      <Footer />
    </main>
  )
}
