import { 
  ScanText, 
  HardDrive, 
  Link2, 
  BadgeCheck, 
  ArrowLeftRight, 
  Eye 
} from "lucide-react"

const features = [
  {
    icon: ScanText,
    title: "OCR Extraction",
    description: "AI-powered document parsing automatically extracts property details from uploaded documents."
  },
  {
    icon: HardDrive,
    title: "IPFS Storage",
    description: "Decentralized file storage ensures your property documents are always accessible and secure."
  },
  {
    icon: Link2,
    title: "Blockchain Registry",
    description: "Tamper-proof ownership records stored on an immutable blockchain ledger."
  },
  {
    icon: BadgeCheck,
    title: "Authority Verification",
    description: "Government-approved verification system for official property authentication."
  },
  {
    icon: ArrowLeftRight,
    title: "Ownership Transfer",
    description: "Secure, instant property transfers with complete transaction history."
  },
  {
    icon: Eye,
    title: "Public Verification",
    description: "Anyone can verify property ownership and view the complete chain of custody."
  }
]

export function FeaturesSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Complete Property Registry Solution
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From document upload to ownership transfer, our platform handles every step with blockchain security.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-border hover:bg-card"
            >
              {/* Glass Highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary">
                  <feature.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
