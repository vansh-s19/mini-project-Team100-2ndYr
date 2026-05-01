"use client"

import { useState } from "react"
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
  MoreHorizontal, 
  Building2,
  LayoutGrid,
  List
} from "lucide-react"

const properties = [
  {
    id: "PROP-001",
    name: "Manhattan Luxury Condo",
    owner: "0x1234...5678",
    status: "verified",
    area: "2,500 sq ft",
    location: "Manhattan, NY",
    registryId: "REG-NYC-847291",
    value: "$1,250,000"
  },
  {
    id: "PROP-002",
    name: "Brooklyn Heights Apartment",
    owner: "0x1234...5678",
    status: "pending",
    area: "1,800 sq ft",
    location: "Brooklyn, NY",
    registryId: "REG-NYC-847292",
    value: "$890,000"
  },
  {
    id: "PROP-003",
    name: "Queens Office Space",
    owner: "0x1234...5678",
    status: "verified",
    area: "3,200 sq ft",
    location: "Queens, NY",
    registryId: "REG-NYC-847293",
    value: "$2,100,000"
  },
  {
    id: "PROP-004",
    name: "Bronx Commercial Building",
    owner: "0x1234...5678",
    status: "rejected",
    area: "950 sq ft",
    location: "Bronx, NY",
    registryId: "REG-NYC-847294",
    value: "$450,000"
  }
]

const statusStyles = {
  verified: "border-white/30 bg-white/10 text-white",
  pending: "border-muted-foreground/30 bg-muted text-muted-foreground",
  rejected: "border-muted-foreground/20 bg-muted/50 text-muted-foreground/70"
}

export default function MyPropertiesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
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
              <p className="text-muted-foreground">{properties.length} properties registered</p>
            </div>
            <Button asChild className="gap-2 rounded-xl">
              <Link href="/register">
                <Plus className="h-4 w-4" />
                Register New Property
              </Link>
            </Button>
          </div>

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
                  <SelectItem value="rejected">Rejected</SelectItem>
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

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-border hover:bg-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`rounded-md text-xs capitalize ${statusStyles[property.status as keyof typeof statusStyles]}`}
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4 text-lg">{property.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 border-t border-border/50 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Property ID</span>
                        <span className="font-mono">{property.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Area</span>
                        <span>{property.area}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-semibold">{property.value}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="mt-4 w-full gap-2 rounded-xl">
                      <Link href={`/properties/${property.id}`}>
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Property
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Area
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Value
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredProperties.map((property) => (
                      <tr key={property.id} className="transition-colors hover:bg-accent/30">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{property.name}</p>
                            <p className="text-sm text-muted-foreground">{property.location}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-mono text-sm">{property.id}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Badge 
                            variant="outline" 
                            className={`rounded-md text-xs capitalize ${statusStyles[property.status as keyof typeof statusStyles]}`}
                          >
                            {property.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {property.area}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold">
                          {property.value}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <Link href={`/properties/${property.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
