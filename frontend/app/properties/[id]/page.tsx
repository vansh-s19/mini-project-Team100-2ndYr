import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  FileText, 
  ArrowLeftRight,
  Building2,
  MapPin,
  Ruler,
  Calendar,
  User,
  Hash
} from "lucide-react"

// Mock data - in real app would fetch based on ID
const propertyData = {
  id: "PROP-001",
  name: "Manhattan Luxury Condo",
  status: "verified",
  owner: "0x1234567890abcdef1234567890abcdef12345678",
  area: "2,500 sq ft",
  location: "245 Park Avenue, Manhattan, NY 10167",
  registryId: "REG-NYC-847291",
  plotNumber: "PLT-2024-00847",
  value: "$1,250,000",
  registrationDate: "2024-03-15",
  ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  transactionHash: "0x8f7d8b9c0a1e2f3d4c5b6a7908172635443b2c1d0e9f8a7b6c5d4e3f2a1b0c9d",
  ownershipHistory: [
    {
      date: "2024-03-15",
      event: "Property Registered",
      from: "-",
      to: "0x1234...5678",
      txHash: "0x8f7d...0c9d"
    },
    {
      date: "2024-03-16",
      event: "Verified by Authority",
      from: "-",
      to: "-",
      txHash: "0x9a8b...1d2e"
    }
  ]
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <main className="min-h-screen bg-[#0f1513]">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-4">
          {/* Back Button */}
          <Link href="/properties" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Link>

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{propertyData.name}</h1>
                  <Badge 
                    variant="outline" 
                    className="rounded-md border-white/30 bg-white/10 capitalize"
                  >
                    {propertyData.status}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{propertyData.location}</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">{id}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 rounded-xl">
                <FileText className="h-4 w-4" />
                View Document
              </Button>
              <Button asChild className="gap-2 rounded-xl">
                <Link href="/transfer">
                  <ArrowLeftRight className="h-4 w-4" />
                  Transfer
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Property Details */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
                <CardDescription>Complete details about this property</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Owner Address</p>
                    <p className="font-mono text-sm break-all">{propertyData.owner.slice(0, 20)}...{propertyData.owner.slice(-8)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registry ID</p>
                    <p className="font-mono text-sm">{propertyData.registryId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plot Number</p>
                    <p className="font-mono text-sm">{propertyData.plotNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Ruler className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="text-sm">{propertyData.area}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Date</p>
                    <p className="text-sm">{propertyData.registrationDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Value</p>
                    <p className="text-sm font-semibold">{propertyData.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Info */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Blockchain Data</CardTitle>
                <CardDescription>On-chain references</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">IPFS Document Hash</p>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                    <span className="flex-1 truncate font-mono text-xs">{propertyData.ipfsHash}</span>
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
                    <span className="flex-1 truncate font-mono text-xs">{propertyData.transactionHash}</span>
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

          {/* Ownership History Timeline */}
          <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Ownership History</CardTitle>
              <CardDescription>Complete timeline of property events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                
                <div className="space-y-6">
                  {propertyData.ownershipHistory.map((event, index) => (
                    <div key={index} className="relative flex gap-4 pl-10">
                      {/* Timeline dot */}
                      <div className="absolute left-2 top-1 h-4 w-4 rounded-full border-2 border-foreground bg-background" />
                      
                      <div className="flex-1 rounded-xl border border-border/50 bg-secondary/30 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium">{event.event}</p>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{event.txHash}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {event.from !== "-" && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">From:</span>
                            <span className="font-mono">{event.from}</span>
                            <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">To:</span>
                            <span className="font-mono">{event.to}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
