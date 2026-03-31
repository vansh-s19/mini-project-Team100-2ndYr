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
    <main className="min-h-screen bg-[#0f1513]">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                <Shield className="h-5 w-5 text-background" />
              </div>
              <Badge variant="outline" className="rounded-md border-white/30 bg-white/10">
                Authority Access
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Authority Dashboard</h1>
            <p className="text-muted-foreground">Review and verify pending property registrations</p>
          </div>

          {!isConnected && (
            <div className="mb-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-yellow-400">
              Please connect your wallet (authority account) to manage properties.
            </div>
          )}

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : pendingProperties.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : verifiedCount}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-sm">{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "N/A"}</p>
                  <p className="text-sm text-muted-foreground">Authority</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Properties Table */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Properties awaiting authority approval</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingProperties.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No pending properties to review.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Property
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Owner
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Registry ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Area
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {pendingProperties.map((property) => (
                        <tr key={property.id} className="transition-colors hover:bg-accent/30">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{property.ownerName || "Unknown"}</p>
                              <p className="text-sm text-muted-foreground">{property.propertyAddress}</p>
                              <p className="font-mono text-xs text-muted-foreground">ID: {property.id}</p>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="font-mono text-sm">{property.owner.slice(0, 6)}...{property.owner.slice(-4)}</span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            {property.registryId}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            {property.area}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                className="gap-1 rounded-lg"
                                onClick={() => handleAction(property, "verify")}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Verify
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1 rounded-lg"
                                onClick={() => handleAction(property, "reject")}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
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

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedProperty && !!actionType} onOpenChange={() => { setSelectedProperty(null); setActionType(null); }}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "verify" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Verify Property
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Reject Property
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === "verify" 
                ? `Are you sure you want to verify property #${selectedProperty?.id}? This action will be recorded on the blockchain.`
                : `Please provide a reason for rejecting property #${selectedProperty?.id}.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {actionType === "reject" && (
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px] rounded-lg bg-secondary/50"
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedProperty(null); setActionType(null); }} className="rounded-lg">
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={isProcessing || (actionType === "reject" && !rejectionReason)}
              className={`gap-2 rounded-lg ${actionType === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}`}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : actionType === "verify" ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Verification
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
