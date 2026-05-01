"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeftRight, 
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle
} from "lucide-react"

const userProperties = [
  { id: "PROP-001", name: "Manhattan Luxury Condo" },
  { id: "PROP-003", name: "Queens Office Space" },
]

type TransferStatus = "idle" | "pending" | "approved" | "completed"

export default function TransferPropertyPage() {
  const [selectedProperty, setSelectedProperty] = useState("")
  const [newOwnerAddress, setNewOwnerAddress] = useState("")
  const [transferStatus, setTransferStatus] = useState<TransferStatus>("idle")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTransfer = () => {
    if (!selectedProperty || !newOwnerAddress) return
    
    setIsProcessing(true)
    setTransferStatus("pending")
    
    // Simulate transfer process
    setTimeout(() => {
      setTransferStatus("approved")
      setTimeout(() => {
        setTransferStatus("completed")
        setIsProcessing(false)
      }, 2000)
    }, 2000)
  }

  const statusSteps = [
    { status: "pending", label: "Pending", icon: Clock },
    { status: "approved", label: "Approved", icon: CheckCircle },
    { status: "completed", label: "Completed", icon: CheckCircle },
  ]

  const getStepStatus = (stepStatus: string) => {
    const statusOrder = ["idle", "pending", "approved", "completed"]
    const currentIndex = statusOrder.indexOf(transferStatus)
    const stepIndex = statusOrder.indexOf(stepStatus)
    
    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  return (
    <main className="min-h-screen bg-[#0f1513]">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-4">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary">
              <ArrowLeftRight className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Transfer Property</h1>
            <p className="mt-2 text-muted-foreground">
              Securely transfer property ownership to a new wallet address
            </p>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>
                Select the property and enter the new owner&apos;s wallet address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Selection */}
              <div className="space-y-2">
                <Label htmlFor="property">Property to Transfer</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="rounded-xl bg-secondary/50">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProperties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        <span className="font-medium">{property.name}</span>
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          ({property.id})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* New Owner Address */}
              <div className="space-y-2">
                <Label htmlFor="newOwner">New Owner Wallet Address</Label>
                <Input
                  id="newOwner"
                  placeholder="0x..."
                  value={newOwnerAddress}
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                  className="rounded-xl bg-secondary/50 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the Ethereum wallet address of the new property owner
                </p>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Important</p>
                  <p className="text-muted-foreground">
                    Property transfers are permanent and recorded on the blockchain. 
                    Please verify the wallet address before proceeding.
                  </p>
                </div>
              </div>

              {/* Transfer Button */}
              <Button 
                onClick={handleTransfer}
                disabled={!selectedProperty || !newOwnerAddress || isProcessing}
                className="w-full gap-2 rounded-xl"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Transfer...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="h-4 w-4" />
                    Initiate Transfer
                  </>
                )}
              </Button>

              {/* Status Flow */}
              {transferStatus !== "idle" && (
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="mb-4 text-sm font-medium">Transfer Status</h3>
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, index) => {
                      const status = getStepStatus(step.status)
                      const StepIcon = step.icon
                      
                      return (
                        <div key={step.status} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                              status === "completed" 
                                ? "border-foreground bg-foreground text-background" 
                                : status === "current"
                                  ? "border-foreground bg-transparent"
                                  : "border-muted bg-transparent"
                            }`}>
                              {status === "current" && isProcessing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <StepIcon className={`h-5 w-5 ${status === "upcoming" ? "text-muted" : ""}`} />
                              )}
                            </div>
                            <span className={`mt-2 text-xs font-medium ${status === "upcoming" ? "text-muted" : ""}`}>
                              {step.label}
                            </span>
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div className={`mx-2 h-0.5 flex-1 transition-all ${
                              status === "completed" ? "bg-foreground" : "bg-muted"
                            }`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {transferStatus === "completed" && (
                    <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
                      <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                      <p className="font-medium">Transfer Completed Successfully!</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The property has been transferred to the new owner.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
