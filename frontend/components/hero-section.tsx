import Hero3D from "./Hero3D";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, FileCheck } from "lucide-react"
import ElectricBorder from "@/components/ElectricBorder"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
      
      {/* Grid Background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Gradient Orbs */}
      <div className="pointer-events-none absolute top-20 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-white/3 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        
        {/* 🔥 MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">

          {/* ================= LEFT SIDE ================= */}
          <div className="text-left">

            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-2 backdrop-blur-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">
                Blockchain-Powered Registry
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Secure Property Ownership on{" "}
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Blockchain
              </span>
            </h1>

            {/* Subtext */}
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-xl">
              Register, verify, and transfer real estate with AI-powered OCR and decentralized storage. 
              Tamper-proof records for the modern world.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <ElectricBorder
                color="#7df9ff"
                speed={1}
                chaos={0.12}
                className=""
                style={{ borderRadius: 12 }}
              >
                <Button asChild size="lg" className="gap-2 rounded-xl px-8 text-base">
                  <Link href="/register">
                    <FileCheck className="h-5 w-5" />
                    Register Property
                  </Link>
                </Button>
              </ElectricBorder>

              <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl px-8 text-base">
                <Link href="/verify">
                  <Shield className="h-5 w-5" />
                  Verify Property
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border/50 pt-10">
              <div>
                <p className="text-2xl font-bold sm:text-3xl">12,450+</p>
                <p className="text-sm text-muted-foreground">Properties Registered</p>
              </div>
              <div>
                <p className="text-2xl font-bold sm:text-3xl">$2.1B</p>
                <p className="text-sm text-muted-foreground">Total Value Secured</p>
              </div>
              <div>
                <p className="text-2xl font-bold sm:text-3xl">99.9%</p>
                <p className="text-sm text-muted-foreground">Verification Rate</p>
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDE (3D) ================= */}
          <div className="w-full h-[500px] md:h-[600px]">
            <Hero3D />
          </div>

        </div>
      </div>
    </section>
  )
}