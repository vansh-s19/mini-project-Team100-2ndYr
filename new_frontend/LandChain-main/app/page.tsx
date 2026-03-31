import { Header } from "@/components/header"
import { ScrollytellingHero } from "@/components/scrollytelling-hero"
import { FeaturesSection } from "@/components/features-section"
import { DashboardPreview } from "@/components/dashboard-preview"
import { WorkflowSection } from "@/components/workflow-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import Particles from "@/components/Particles"


export default function HomePage() {
  return (
    <main className="min-h-screen bg-background relative">
      {/* Fixed particle background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      {/* Page content above particles */}
      <div className="relative z-10">
        <Header />
        <ScrollytellingHero />
        <FeaturesSection />
        <DashboardPreview />
        <WorkflowSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  )
}

