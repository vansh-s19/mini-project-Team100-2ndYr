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
  Search, 
  Plus, 
  Eye, 
  Building2,
  LayoutGrid,
  List,
  Loader2
} from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"

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

  const loadMyProperties = useCallback(async () => {
    if (!contract || !account) return
    setLoading(true)
    try {
      const propIds = await contract.getPropertiesByOwner(account)
      const props: Property[] = []

      for (const id of propIds) {
        try {
          const prop = await contract.getProperty(id.toNumber())
          if (prop.exists) {
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
          }
        } catch { /* skip */ }
      }

      setProperties(props)
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
                              </div>
                              <Button asChild variant="outline" className="mt-4 w-full gap-2 rounded-xl">
                                <Link href={`/verify?id=${property.id}`}>
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}

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
