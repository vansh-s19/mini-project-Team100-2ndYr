"use client"

import { useState } from "react"
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
  ArrowLeftRight,
  Clock
} from "lucide-react"

interface PropertyResult {
  id: string
  name: string
  owner: string
  status: "verified" | "pending" | "rejected"
  location: string
  area: string
  registryId: string
  registrationDate: string
  ipfsHash: string
  transactionHash: string
  ownershipHistory: Array<{
    date: string
    event: string
    from: string
    to: string
  }>
}

const mockResult: PropertyResult = {
  id: "PROP-001",
  name: "Manhattan Luxury Condo",
  owner: "0x1234567890abcdef1234567890abcdef12345678",
  status: "verified",
  location: "245 Park Avenue, Manhattan, NY 10167",
  area: "2,500 sq ft",
  registryId: "REG-NYC-847291",
  registrationDate: "2024-03-15",
  ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  transactionHash: "0x8f7d8b9c0a1e2f3d4c5b6a7908172635443b2c1d0e9f8a7b6c5d4e3f2a1b0c9d",
  ownershipHistory: [
    { date: "2024-03-15", event: "Registered", from: "-", to: "0x1234...5678" },
    { date: "2024-03-16", event: "Verified", from: "-", to: "-" }
  ]
}

export default function PublicVerificationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<PropertyResult | null>(null)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setNotFound(false)
    setResult(null)

    // Simulate search
    setTimeout(() => {
      if (searchQuery.toLowerCase().includes("prop") || searchQuery.includes("001")) {
        setResult(mockResult)
      } else {
        setNotFound(true)
      }
      setIsSearching(false)
    }, 1500)
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

          {/* Search Form */}
          <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter Property ID (e.g., PROP-001)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-xl bg-secondary/50 pl-12 text-base"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 gap-2 rounded-xl px-8" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-green-500 bg-green-500/10">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold">{result.name}</h2>
                      <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-500">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{result.location}</p>
                    <p className="mt-1 font-mono text-sm text-muted-foreground">{result.id}</p>
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
                      <span className="text-muted-foreground">Owner</span>
                      <span className="font-mono text-sm">{result.owner.slice(0, 10)}...{result.owner.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground">Registry ID</span>
                      <span className="font-mono text-sm">{result.registryId}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground">Area</span>
                      <span>{result.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered</span>
                      <span>{result.registrationDate}</span>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">Transaction Hash</p>
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                        <span className="flex-1 truncate font-mono text-xs">{result.transactionHash}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
                          <ExternalLink className="h-4 w-4" />
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
                  <CardDescription>Complete timeline of property events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-4">
                      {result.ownershipHistory.map((event, index) => (
                        <div key={index} className="relative flex gap-4 pl-10">
                          <div className="absolute left-2 top-1 h-4 w-4 rounded-full border-2 border-foreground bg-background" />
                          <div className="flex-1 rounded-xl border border-border/50 bg-secondary/30 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{event.event}</p>
                                <p className="text-sm text-muted-foreground">{event.date}</p>
                              </div>
                              {event.to !== "-" && (
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-mono">{event.to}</span>
                                </div>
                              )}
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

      <Footer />
    </main>
  )
}
