"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye,
  Clock,
  FileText,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"

interface PendingProperty {
  id: number
  ownerName: string
  owner: string
  registryId: string
  area: string
  propertyAddress: string
  ipfsHash: string
}

export default function AuthorityDashboardPage() {
  const { contract, isConnected, account } = useWeb3()
  const [pendingProperties, setPendingProperties] = useState<PendingProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<PendingProperty | null>(null)
  const [actionType, setActionType] = useState<"verify" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [verifiedCount, setVerifiedCount] = useState(0)

  const loadProperties = useCallback(async () => {
    if (!contract) return
    setLoading(true)
    try {
      const count = await contract.getPropertyCount()
      const total = count.toNumber()
      const pending: PendingProperty[] = []
      let verified = 0

      for (let i = 1; i <= total; i++) {
        try {
          const prop = await contract.getProperty(i)
          if (prop.verified) {
            verified++
          } else if (prop.exists) {
            pending.push({
              id: prop.id.toNumber(),
              ownerName: prop.ownerName,
              owner: prop.owner,
              registryId: prop.registryId,
              area: prop.area,
              propertyAddress: prop.propertyAddress,
              ipfsHash: prop.ipfsHash,
            })
          }
        } catch { /* skip non-existent */ }
      }

      setPendingProperties(pending)
      setVerifiedCount(verified)
    } catch (error) {
      console.error("Error loading properties:", error)
    } finally {
      setLoading(false)
    }
  }, [contract])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const handleAction = (property: PendingProperty, action: "verify" | "reject") => {
    setSelectedProperty(property)
    setActionType(action)
  }

  const confirmAction = async () => {
    if (!contract || !selectedProperty) return
    setIsProcessing(true)
    try {
      if (actionType === "verify") {
        const tx = await contract.verifyProperty(selectedProperty.id)
        await tx.wait()
      } else {
        const tx = await contract.rejectProperty(selectedProperty.id)
        await tx.wait()
      }
      setSelectedProperty(null)
      setActionType(null)
      setRejectionReason("")
      await loadProperties()
    } catch (error: any) {
      console.error("Action error:", error)
      alert(`Action failed: ${error.reason || error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1513] text-white">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/50 border border-border">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                 <Badge variant="outline" className="rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black uppercase text-[10px] tracking-widest px-3">
                   Authority Console
                 </Badge>
                 <h1 className="text-3xl font-black tracking-tight mt-1">Registry Oversight</h1>
              </div>
            </div>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest leading-relaxed">Review and authenticate decentralized document hashes against government land records.</p>
          </div>

          {!isConnected && (
            <div className="mb-8 rounded-3xl border border-border/50 bg-secondary/30 p-6 text-center text-slate-400 font-mono text-sm backdrop-blur-xl">
              Node Connection Required: Please authenticate with an Authority Wallet to manage global property records.
            </div>
          )}

          {/* Stats Bar */}
          <div className="mb-12 grid gap-6 sm:grid-cols-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-[32px] overflow-hidden group hover:border-emerald-500/20 transition-all">
              <CardContent className="flex items-center gap-5 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 border border-border group-hover:bg-emerald-500/5 transition-all">
                  <Clock className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{loading ? "..." : pendingProperties.length}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Awaiting Review</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-[32px] overflow-hidden group hover:border-emerald-500/20 transition-all">
              <CardContent className="flex items-center gap-5 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 border border-border group-hover:bg-emerald-500/5 transition-all">
                  <CheckCircle className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{loading ? "..." : verifiedCount}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Ledger Authenticated</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-[32px] overflow-hidden relative group hover:border-emerald-500/20 transition-all">
              <div className="absolute top-0 right-0 p-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <CardContent className="flex items-center gap-5 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 border border-border group-hover:bg-emerald-500/5 transition-all">
                  <Shield className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-white font-mono">{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "AUTH_NULL"}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Authorized Validator</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Properties Feed */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-[40px] overflow-hidden p-2">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                Verification Queue
              </CardTitle>
              <CardDescription className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2">Authenticating incoming registry requests vs government datasets.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Syncing Neural Ledger...</span>
                </div>
              ) : pendingProperties.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">Queue Clear: All assets authenticated.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Asset Identity</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Registry ID</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Dimensions</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Protocol Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pendingProperties.map((property) => (
                        <tr key={property.id} className="transition-all hover:bg-secondary/20 group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <p className="font-black text-sm uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{property.ownerName || "Asset #"+property.id}</p>
                              <p className="text-[10px] text-slate-500 font-mono max-w-[240px] truncate">{property.propertyAddress}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="font-black text-slate-400 font-mono text-xs">{property.registryId}</span>
                          </td>
                          <td className="px-8 py-6">
                            <Badge variant="outline" className="rounded-lg border-border bg-secondary/50 font-black text-[10px] px-3 py-1 text-slate-400">
                              {property.area} SQFT
                            </Badge>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Button 
                                size="sm" 
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/10 font-black text-[10px] uppercase tracking-widest px-5 h-10"
                                onClick={() => handleAction(property, "verify")}
                              >
                                Authenticate
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-xl border border-border/50 hover:bg-secondary text-[10px] font-black uppercase tracking-widest h-10 px-5"
                                onClick={() => handleAction(property, "reject")}
                              >
                                Flag
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Futuristic Dialogs */}
      <Dialog open={!!selectedProperty && !!actionType} onOpenChange={() => { setSelectedProperty(null); setActionType(null); }}>
        <DialogContent className="border-border/50 bg-[#0f1513]/95 backdrop-blur-3xl rounded-[40px] shadow-2xl p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
              {actionType === "verify" ? (
                <>
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                  AUTHENTICATE ASSET
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  PROTOCOL REJECTION
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-4 leading-relaxed">
              {actionType === "verify" 
                ? `System authentication requested for Asset ID #${selectedProperty?.id}. Once confirmed, the registry record will be permanently validated on-chain.`
                : `Specify the violation protocol for the rejection of Asset ID #${selectedProperty?.id}.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {actionType === "reject" && (
            <Textarea
              placeholder="System Violation Entry..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[120px] rounded-2xl bg-secondary/50 border-border/50 focus:border-red-500/50 mt-4 font-mono text-sm p-4"
            />
          )}

          <DialogFooter className="mt-8 gap-3 sm:gap-0">
            <Button variant="ghost" onClick={() => { setSelectedProperty(null); setActionType(null); }} className="rounded-xl border border-border/50 text-[10px] font-black uppercase tracking-widest h-12 px-6">
              Abort
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={isProcessing || (actionType === "reject" && !rejectionReason)}
              className={`rounded-xl px-8 h-12 font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${actionType === "reject" ? "bg-red-600 hover:bg-red-500 shadow-red-500/20" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"}`}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : actionType === "verify" ? (
                "Finalise Entry"
              ) : (
                "Issue Flag"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
