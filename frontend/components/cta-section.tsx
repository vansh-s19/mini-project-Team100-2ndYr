import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-12 text-center backdrop-blur-sm sm:p-16">
          {/* Background Gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
          
          {/* Decorative Orbs */}
          <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Start Registering Property on Blockchain
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Join thousands of property owners who trust LandChain for secure, transparent, and immutable property registration.
            </p>
            <Button asChild size="lg" className="gap-2 rounded-xl px-8">
              <Link href="/register">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
