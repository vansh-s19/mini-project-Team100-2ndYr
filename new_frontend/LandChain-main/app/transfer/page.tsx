"use client"

import { useState, useEffect, useCallback } from "react"
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
import { useWeb3 } from "@/context/Web3Context"

interface OwnedProperty {
  id: number
  ownerName: string
  registryId: string
  verified: boolean
}

export default function TransferPropertyPage() {
  const { contract, isConnected, account } = useWeb3()
  const [userProperties, setUserProperties] = useState<OwnedProperty[]>([])
  const [loadingProps, setLoadingProps] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState("")
  const [newOwnerAddress, setNewOwnerAddress] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transferComplete, setTransferComplete] = useState(false)

  const loadUserProperties = useCallback(async () => {
    if (!contract || !account) return
    setLoadingProps(true)
    try {
      const propIds = await contract.getPropertiesByOwner(account)
      const props: OwnedProperty[] = []

      for (const id of propIds) {
        try {
          const prop = await contract.getProperty(id.toNumber())
          if (prop.exists && prop.verified) {
            props.push({
              id: prop.id.toNumber(),
              ownerName: prop.ownerName,
              registryId: prop.registryId,
              verified: prop.verified,
            })
          }
        } catch { /* skip */ }
      }

      setUserProperties(props)
    } catch (error) {
      console.error("Error loading properties:", error)
    } finally {
      setLoadingProps(false)
    }
  }, [contract, account])

  useEffect(() => {
    if (isConnected) {
      loadUserProperties()
    } else {
      setUserProperties([])
      setLoadingProps(false)
    }
  }, [isConnected, loadUserProperties])

  const handleTransfer = async () => {
    if (!selectedProperty || !newOwnerAddress || !contract) return

    setIsProcessing(true)
    setTransferComplete(false)
    try {
      const tx = await contract.transferProperty(parseInt(selectedProperty), newOwnerAddress)
      await tx.wait()
      setTransferComplete(true)
      await loadUserProperties()
    } catch (error: any) {
      console.error("Transfer error:", error)
      alert(`Transfer failed: ${error.reason || error.message}`)
    } finally {
      setIsProcessing(false)
    }
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

          {!isConnected && (
            <div className="mb-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-yellow-400">
              Please connect your wallet to transfer a property.
            </div>
          )}

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
                {loadingProps ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading your verified properties...
                  </div>
                ) : userProperties.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No verified properties available for transfer.
                  </p>
                ) : (
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="rounded-xl bg-secondary/50">
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {userProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          <span className="font-medium truncate block max-w-[200px]">{property.ownerName || "Property Owner(s)"}</span>
                          <span className="ml-2 font-mono text-xs text-muted-foreground shrink-0">
                            (#{property.id})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                disabled={!selectedProperty || !newOwnerAddress || isProcessing || !isConnected}
                className="w-full gap-2 rounded-xl"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Transfer on Blockchain...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="h-4 w-4" />
                    Initiate Transfer
                  </>
                )}
              </Button>

              {/* Success Message */}
              {transferComplete && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                  <p className="font-medium">Transfer Completed Successfully!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The property has been transferred to the new owner on the blockchain.
                  </p>
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
