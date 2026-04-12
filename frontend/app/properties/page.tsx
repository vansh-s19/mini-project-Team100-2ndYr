"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Plus, 
  Eye, 
  Building2,
  LayoutGrid,
  List,
  Loader2,
  TrendingUp,
  Activity,
  XCircle,
  CheckCircle2,
  Tag,
  IndianRupee
} from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"
import axios from "axios"

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
  // DB-sync fields
  dbId?: string
  isListed?: boolean
  listPrice?: number
  marketCategory?: string
}

const statusStyles = {
  verified: "border-white/30 bg-white/10 text-white",
  pending: "border-muted-foreground/30 bg-muted text-muted-foreground",
}

export default function MyPropertiesPage() {
  const { contract, isConnected, account } = useWeb3()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Listing Modal State
  const [isListingModalOpen, setIsListingModalOpen] = useState(false)
  const [selectedPropertyForListing, setSelectedPropertyForListing] = useState<Property | null>(null)
  const [listingPrice, setListingPrice] = useState("")
  const [listingCategory, setListingCategory] = useState<"Buying" | "Rental">("Buying")
  const [isSubmittingListing, setIsSubmittingListing] = useState(false)

  const loadMyProperties = useCallback(async () => {
    if (!contract || !account) return
    setLoading(true)
    try {
      // 1. Fetch from Blockchain
      const propIds = await contract.getPropertiesByOwner(account)
      const blockchainProps: any[] = []

      for (const id of propIds) {
        try {
          const prop = await contract.getProperty(id.toNumber())
          if (prop.exists) {
            blockchainProps.push({
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
          }
        } catch { /* skip */ }
      }

      // 2. Fetch from DB for enrichment (isListed, listPrice etc)
      let dbProps: any[] = []
      try {
        const dbResp = await axios.get(`http://localhost:5001/api/property/owner/${account}`)
        if (dbResp.data.success) dbProps = dbResp.data.properties
      } catch (err) {
        console.error("DB Fetch Error:", err)
      }

      // 3. Merge Data
      const enriched = blockchainProps.map(bp => {
        const dp = dbProps.find(p => p.registryId === bp.registryId)
        return {
          ...bp,
          dbId: dp?._id,
          isListed: dp?.isListed || false,
          listPrice: dp?.listPrice,
          marketCategory: dp?.marketCategory
        }
      })

      setProperties(enriched)
    } catch (error) {
      console.error("Error loading properties:", error)
    } finally {
      setLoading(false)
    }
  }, [contract, account])

  useEffect(() => {
    if (isConnected) {
      loadMyProperties()
    } else {
      setProperties([])
      setLoading(false)
    }
  }, [isConnected, loadMyProperties])

  const handleToggleListing = async (property: Property, isUnlisting = false) => {
    if (!property.dbId) {
       alert("Property record not found in database. Please contact support.")
       return
    }

    if (isUnlisting) {
      if (!confirm("Are you sure you want to remove this property from the marketplace?")) return
      try {
        await axios.patch(`http://localhost:5001/api/property/${property.dbId}/list`, {
          isListed: false,
          ownerAddress: account
        })
        loadMyProperties()
      } catch (error) {
        alert("Failed to unlist property")
      }
      return
    }

    // Listing flow
    const priceStr = prompt("Enter listing price (in ₹ Lakhs):", "50")
    if (!priceStr) return
    const priceNum = parseFloat(priceStr) * 100000 // Convert Lakhs to raw INR

    const category = prompt("Market Category (Buying / Rental):", "Buying")
    if (!category || (category !== "Buying" && category !== "Rental")) {
       alert("Invalid category. Must be 'Buying' or 'Rental'")
       return
    }

    try {
      await axios.patch(`http://localhost:5001/api/property/${property.dbId}/list`, {
        isListed: true,
        listPrice: priceNum,
        marketCategory: listingCategory,
        ownerAddress: account
      })
      setIsListingModalOpen(false)
      loadMyProperties()
    } catch (error) {
      alert("Failed to list property")
    } finally {
      setIsSubmittingListing(false)
    }
  }

  const handleSubmitListing = async () => {
    if (!selectedPropertyForListing) return
    
    setIsSubmittingListing(true)
    try {
      let currentDbId = selectedPropertyForListing.dbId;

      // 1. If DB ID is missing, try to auto-sync/repair it
      if (!currentDbId) {
        console.log("Auto-syncing property record before listing...");
        const syncResp = await axios.post("http://localhost:5001/api/property/ensure-record", {
          registryId: selectedPropertyForListing.registryId,
          ownerAddress: account,
          ownerNames: selectedPropertyForListing.ownerName,
          area: selectedPropertyForListing.area,
          address: selectedPropertyForListing.propertyAddress
        })
        if (syncResp.data.success) {
          currentDbId = syncResp.data.dbId;
        } else {
          throw new Error("Failed to sync property record");
        }
      }

      // 2. Proceed with listing patch
      const priceNum = parseFloat(listingPrice) * 100000 // Convert Lakhs to raw INR
      await axios.patch(`http://localhost:5001/api/property/${currentDbId}/list`, {
        isListed: true,
        listPrice: priceNum,
        marketCategory: listingCategory,
        ownerAddress: account
      })
      
      setIsListingModalOpen(false)
      loadMyProperties()
    } catch (error) {
      console.error("Listing Error:", error);
      alert("Failed to finalize listing. Please try again.");
    } finally {
      setIsSubmittingListing(false)
    }
  }

  const openListingModal = (property: Property) => {
    setSelectedPropertyForListing(property)
    setListingPrice("")
    setListingCategory("Buying")
    setIsListingModalOpen(true)
  }

  const filteredProperties = properties.filter(property => {
    const status = property.verified ? "verified" : "pending"
    const matchesSearch = property.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.registryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.id.toString().includes(searchQuery)
    const matchesStatus = statusFilter === "all" || status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <main className="min-h-screen bg-[#0f1513]">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
              <p className="text-muted-foreground">
                {loading ? "Loading..." : `${properties.length} properties registered`}
              </p>
            </div>
            <Button asChild className="gap-2 rounded-xl">
              <Link href="/register">
                <Plus className="h-4 w-4" />
                Register New Property
              </Link>
            </Button>
          </div>

          {!isConnected && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-yellow-400">
              Please connect your wallet to view your properties.
            </div>
          )}

          {isConnected && (
            <>
              {/* Filters */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-xl bg-secondary/50 pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 rounded-xl bg-secondary/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="rounded-lg"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("table")}
                    className="rounded-lg"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProperties.length === 0 ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {properties.length === 0 
                      ? "You don't have any registered properties yet."
                      : "No properties match your filters."
                    }
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProperties.map((property) => {
                        const status = property.verified ? "verified" : "pending"
                        return (
                          <Card key={property.id} className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-border hover:bg-card">
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary">
                                  <Building2 className="h-6 w-6" />
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`rounded-md text-xs capitalize ${statusStyles[status]}`}
                                >
                                  {status}
                                </Badge>
                              </div>
                              <CardTitle className="mt-4 text-lg">{property.ownerName || "Property"}</CardTitle>
                              <p className="text-sm text-muted-foreground">{property.propertyAddress}</p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3 border-t border-border/50 pt-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Property ID</span>
                                  <span className="font-mono">#{property.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Area</span>
                                  <span>{property.area}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Registry ID</span>
                                  <span className="font-mono text-xs">{property.registryId}</span>
                                </div>
                                <div className="flex justify-between border-t border-border/30 pt-3 text-sm">
                                  <span className="text-muted-foreground">Market Status</span>
                                  <Badge 
                                    variant="secondary" 
                                    className={`gap-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${property.isListed ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"}`}
                                  >
                                    {property.isListed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    {property.isListed ? "On Market" : "Internal"}
                                  </Badge>
                                </div>
                                {property.isListed && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Listed Price</span>
                                    <span className="font-bold text-emerald-500">
                                      ₹{(property.listPrice || 0) >= 100000 
                                        ? `${((property.listPrice || 0) / 100000).toFixed(1)} L` 
                                        : (property.listPrice || 0).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-4 flex gap-2">
                                <Button asChild variant="outline" className="flex-1 gap-2 rounded-xl text-xs h-9">
                                  <Link href={`/verify?id=${property.id}`}>
                                    <Eye className="h-4 w-4" />
                                    View
                                  </Link>
                                </Button>
                                
                                <Button 
                                  onClick={() => {
                                    if (property.isListed) {
                                      handleToggleListing(property, true)
                                    } else {
                                      openListingModal(property)
                                    }
                                  }}
                                  variant={property.isListed ? "destructive" : "secondary"} 
                                  className={`flex-1 gap-2 rounded-xl text-xs h-9 font-bold uppercase tracking-tight ${!property.isListed && "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
                                >
                                  {property.isListed ? (
                                    <><XCircle className="h-4 w-4" /> Unlist</>
                                  ) : (
                                    <><Tag className="h-4 w-4" /> List On Market</>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}

                  {/* Listing Modal */}
                  <Dialog open={isListingModalOpen} onOpenChange={setIsListingModalOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-[#1a211e] border-white/5 rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-emerald-500" />
                          List Asset on Marketplace
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Configure the market positioning for your property asset. This will be visible to all Vanguard users.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Listing Category</Label>
                          <div className="flex bg-secondary/30 p-1 rounded-xl border border-white/5">
                            {(["Buying", "Rental"] as const).map((m) => (
                              <button
                                key={m}
                                onClick={() => setListingCategory(m)}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all ${listingCategory === m ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"}`}
                              >
                                {m === "Buying" ? "Direct Sale" : "Rental / Lease"}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            {listingCategory === "Buying" ? "Sale Price (₹ Lakhs)" : "Monthly Rent (₹ Amount)"}
                          </Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            <Input
                              type="number"
                              placeholder={listingCategory === "Buying" ? "e.g. 75" : "e.g. 25000"}
                              value={listingPrice}
                              onChange={(e) => setListingPrice(e.target.value)}
                              className="bg-secondary/50 border-white/10 rounded-xl pl-9 h-12 focus:ring-emerald-500/20 focus:border-emerald-500/50"
                            />
                            {listingCategory === "Buying" && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-500">
                                Lakhs
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleSubmitListing}
                          disabled={isSubmittingListing || !listingPrice}
                          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 gap-2"
                        >
                          {isSubmittingListing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                          Finalize Market Listing
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Table View */}
                  {viewMode === "table" && (
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/50">
                              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Property</th>
                              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</th>
                              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Area</th>
                              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {filteredProperties.map((property) => {
                              const status = property.verified ? "verified" : "pending"
                              return (
                                <tr key={property.id} className="transition-colors hover:bg-accent/30">
                                  <td className="px-6 py-4">
                                    <div>
                                      <p className="font-medium">{property.ownerName || "Property"}</p>
                                      <p className="text-sm text-muted-foreground">{property.propertyAddress}</p>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <span className="font-mono text-sm">#{property.id}</span>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <Badge variant="outline" className={`rounded-md text-xs capitalize ${statusStyles[status]}`}>
                                      {status}
                                    </Badge>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm">{property.area}</td>
                                  <td className="whitespace-nowrap px-6 py-4 text-right">
                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                      <Link href={`/verify?id=${property.id}`}>
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
