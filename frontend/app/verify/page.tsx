"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Shield, 
  CheckCircle,
  User,
  FileText,
  Link2,
  ExternalLink,
  Copy,
  Clock,
  Loader2,
  XCircle,
  Eye
} from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"
import { PropertyDetailsModal } from "@/components/PropertyDetailsModal"

interface PropertyResult {
  id: number
  ownerName: string
  owner: string
  registryId: string
  ipfsHash: string
  verified: boolean
  area: string
  propertyAddress: string
  timestamp: number
  ownershipHistory: string[]
}

export default function PublicVerificationPage() {
  const { contract } = useWeb3()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<PropertyResult | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)

  // ... rest of the component

  // Auto-search if ?id= query param is present
  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      setSearchQuery(id)
      performSearch(id)
    }
  }, [searchParams, contract])

  const BACKEND_URL = "http://localhost:5001"

  const performSearch = async (query: string) => {
    setIsSearching(true)
    setNotFound(false)
    setResult(null)

    try {
      let propertyId: number | null = null
      let dbResult: any = null
      
      // 1. Try treating query as a direct Blockchain ID (if it's a number)
      const parsedId = parseInt(query)
      if (!isNaN(parsedId) && parsedId > 0 && parsedId.toString() === query.trim()) {
        propertyId = parsedId
      }
      
      // 2. Database Lookup (Primary for Registry IDs, Fallback for matching strings)
      console.log("  🔍 Searching Database for:", query)
      const dbResp = await axios.get(`${BACKEND_URL}/api/property/search?query=${encodeURIComponent(query)}`)
      if (dbResp.data.success && dbResp.data.properties.length > 0) {
        dbResult = dbResp.data.properties[0]
        if (dbResult.blockchainId) {
          propertyId = dbResult.blockchainId
          console.log("  ✅ Found linked Blockchain ID:", propertyId)
        }
      }

      // 3. If we have a propertyId AND a contract, get live blockchain data
      if (propertyId && contract) {
        try {
          const prop = await contract.getProperty(propertyId)
          const history = await contract.getOwnershipHistory(propertyId)

          setResult({
            id: prop.id.toNumber(),
            ownerName: prop.ownerName,
            owner: prop.owner,
            registryId: prop.registryId,
            ipfsHash: prop.ipfsHash,
            verified: prop.verified,
            area: prop.area,
            propertyAddress: prop.propertyAddress,
            timestamp: prop.timestamp.toNumber(),
            ownershipHistory: history,
          })
          return;
        } catch (contractErr) {
          console.warn("  ⚠️ Blockchain fetch failed, falling back to DB:", contractErr)
        }
      }

      // 4. Fallback: Show result from Database if no blockchain data is available
      if (dbResult) {
        setResult({
          id: dbResult.blockchainId || 0,
          ownerName: dbResult.ownerNames,
          owner: dbResult.ownerAddress,
          registryId: dbResult.registryId,
          ipfsHash: dbResult.ipfsHash,
          verified: dbResult.verified,
          area: dbResult.area,
          propertyAddress: dbResult.address,
          timestamp: Math.floor(new Date(dbResult.createdAt).getTime() / 1000),
          ownershipHistory: [dbResult.ownerAddress],
        })
      } else {
        throw new Error("Property not found")
      }
    } catch (error) {
      console.error("Search error:", error)
      setNotFound(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    performSearch(searchQuery.trim())
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    })
  }

  const truncateAddress = (addr: string) => {
    if (!addr) return "N/A"
    try {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    } catch (e) {
      return addr || "N/A"
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1513]">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-4">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Public Property Verification
            </h1>
            <p className="mt-2 text-muted-foreground">
              Verify property ownership and view the complete chain of custody
            </p>
          </div>

          {!contract && (
            <div className="mb-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-yellow-400">
              Connect your wallet to enable blockchain lookups.
            </div>
          )}

          {/* Search Form */}
          <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter Property ID (e.g., 1)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-xl bg-secondary/50 pl-12 text-base"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 gap-2 rounded-xl px-8" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Not Found */}
          {notFound && (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Property Not Found</h3>
                <p className="mt-2 text-muted-foreground">
                  No property found with ID &quot;{searchQuery}&quot;. Please check the ID and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Search Result */}
          {result && (
            <div className="space-y-6">
              {/* Verification Status */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex items-center gap-6 py-6">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 ${
                    result.verified 
                      ? "border-green-500 bg-green-500/10" 
                      : "border-yellow-500 bg-yellow-500/10"
                  }`}>
                    {result.verified 
                      ? <CheckCircle className="h-8 w-8 text-green-500" />
                      : <Clock className="h-8 w-8 text-yellow-500" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold truncate max-w-[400px]">{result.ownerName || "Property Owner(s)"}</h2>
                      <Badge variant="outline" className={
                        result.verified 
                          ? "border-green-500/30 bg-green-500/10 text-green-500"
                          : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                      }>
                        {result.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{result.propertyAddress}</p>
                    <p className="mt-1 font-mono text-sm text-muted-foreground uppercase tracking-wider">Khasra / ID #{result.id}</p>
                  </div>
                  <div className="flex-1 text-right">
                    <Button onClick={() => setIsModalOpen(true)} className="rounded-xl gap-2 font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20">
                      View Full Records <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Property Info */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground">Owner Address</span>
                      <span className="font-mono text-sm">{truncateAddress(result.owner)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">SRO Deed / Registry ID</span>
                      <span className="font-mono text-sm">{result.registryId}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground">Area</span>
                      <span>{result.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered</span>
                      <span>{formatDate(result.timestamp)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Blockchain Links */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="h-5 w-5" />
                      Blockchain References
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">IPFS Document</p>
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                        <span className="flex-1 truncate font-mono text-xs">{result.ipfsHash}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={() => copyToClipboard(result.ipfsHash)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <a href={`https://ipfs.io/ipfs/${result.ipfsHash}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">Current Owner Address</p>
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                        <span className="flex-1 truncate font-mono text-xs">{result.owner}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={() => copyToClipboard(result.owner)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ownership History */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Ownership History
                  </CardTitle>
                  <CardDescription>Complete timeline of property ownership</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-4">
                      {result.ownershipHistory.map((owner, index) => (
                        <div key={index} className="relative flex gap-4 pl-10">
                          <div className="absolute left-2 top-1 h-4 w-4 rounded-full border-2 border-foreground bg-background" />
                          <div className="flex-1 rounded-xl border border-border/50 bg-secondary/30 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {index === 0 ? "Original Registration" : `Transfer #${index}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {index === 0 ? "Property registered" : "Ownership transferred"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">{truncateAddress(owner)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <PropertyDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={result?.id || 0}
        registryId={result?.registryId || ""}
        ipfsHash={result?.ipfsHash || ""}
        ownerName={result?.ownerName || ""}
      />

      <Footer />
    </main>
  )
}
