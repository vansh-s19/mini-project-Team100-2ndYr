import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal } from "lucide-react"

const properties = [
  {
    id: "PROP-001",
    owner: "0x1234...5678",
    status: "verified",
    area: "2,500 sq ft",
    location: "Manhattan, NY"
  },
  {
    id: "PROP-002",
    owner: "0x8765...4321",
    status: "pending",
    area: "1,800 sq ft",
    location: "Brooklyn, NY"
  },
  {
    id: "PROP-003",
    owner: "0x9876...1234",
    status: "verified",
    area: "3,200 sq ft",
    location: "Queens, NY"
  },
  {
    id: "PROP-004",
    owner: "0x5432...8765",
    status: "rejected",
    area: "950 sq ft",
    location: "Bronx, NY"
  }
]

const statusStyles = {
  verified: "border-white/30 bg-white/10 text-white",
  pending: "border-muted-foreground/30 bg-muted text-muted-foreground",
  rejected: "border-muted-foreground/20 bg-muted/50 text-muted-foreground/70"
}

export function DashboardPreview() {
  return (
    <section className="relative py-24">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Powerful Dashboard
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Manage all your properties, track verification status, and view ownership history in one place.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative mx-auto max-w-5xl">
          {/* Glow Effect */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-xl" />
          
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
              <div>
                <h3 className="font-semibold">My Properties</h3>
                <p className="text-sm text-muted-foreground">4 properties registered</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-lg text-xs">
                  Filter
                </Button>
                <Button size="sm" className="rounded-lg text-xs">
                  + Add New
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Property ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Area
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Location
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {properties.map((property) => (
                    <tr key={property.id} className="transition-colors hover:bg-accent/30">
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-mono text-sm">{property.id}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-mono text-sm text-muted-foreground">{property.owner}</span>
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
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {property.location}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <Eye className="h-4 w-4" />
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
          </div>
        </div>
      </div>
    </section>
  )
}
