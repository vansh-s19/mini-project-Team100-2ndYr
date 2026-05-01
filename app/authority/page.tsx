"use client"

import { useState } from "react"
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
  AlertTriangle
} from "lucide-react"

const pendingProperties = [
  {
    id: "PROP-005",
    name: "SoHo Art Gallery",
    owner: "0x2345...6789",
    submittedDate: "2024-03-20",
    area: "4,200 sq ft",
    location: "SoHo, NY",
    registryId: "REG-NYC-847295",
    documents: 3
  },
  {
    id: "PROP-006",
    name: "Financial District Office",
    owner: "0x3456...7890",
    submittedDate: "2024-03-19",
    area: "8,500 sq ft",
    location: "Financial District, NY",
    registryId: "REG-NYC-847296",
    documents: 5
  },
  {
    id: "PROP-007",
    name: "Upper West Side Townhouse",
    owner: "0x4567...8901",
    submittedDate: "2024-03-18",
    area: "3,800 sq ft",
    location: "Upper West Side, NY",
    registryId: "REG-NYC-847297",
    documents: 4
  }
]

export default function AuthorityDashboardPage() {
  const [selectedProperty, setSelectedProperty] = useState<typeof pendingProperties[0] | null>(null)
  const [actionType, setActionType] = useState<"verify" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleAction = (property: typeof pendingProperties[0], action: "verify" | "reject") => {
    setSelectedProperty(property)
    setActionType(action)
  }

  const confirmAction = () => {
    setSelectedProperty(null)
    setActionType(null)
    setRejectionReason("")
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

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingProperties.length}</p>
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
                  <p className="text-2xl font-bold">847</p>
                  <p className="text-sm text-muted-foreground">Verified This Month</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Rejected This Month</p>
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
                        Submitted
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Documents
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
                            <p className="font-medium">{property.name}</p>
                            <p className="text-sm text-muted-foreground">{property.location}</p>
                            <p className="font-mono text-xs text-muted-foreground">{property.id}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-mono text-sm">{property.owner}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {property.submittedDate}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{property.documents} files</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <Eye className="h-4 w-4" />
                            </Button>
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
                ? `Are you sure you want to verify ${selectedProperty?.name}? This action will be recorded on the blockchain.`
                : `Please provide a reason for rejecting ${selectedProperty?.name}.`
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
              className={`gap-2 rounded-lg ${actionType === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}`}
              disabled={actionType === "reject" && !rejectionReason}
            >
              {actionType === "verify" ? (
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
