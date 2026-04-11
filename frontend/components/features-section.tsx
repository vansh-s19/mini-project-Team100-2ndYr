"use client"

import { 
  ScanText, 
  HardDrive, 
  Link2, 
  BadgeCheck, 
  ArrowLeftRight, 
  Eye,
  Shield,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: ScanText,
    title: "AI OCR Extraction",
    description: "Our neural engine automatically parses government deeds with 99% accuracy.",
    size: "col-span-12 md:col-span-8",
    bg: "bg-emerald-500/5"
  },
  {
    icon: HardDrive,
    title: "IPFS Secure",
    description: "Decentralized storage layer.",
    size: "col-span-12 md:col-span-4",
    bg: "bg-blue-500/5 text-center"
  },
  {
    icon: Link2,
    title: "Blockchain Registry",
    description: "Tamper-proof ownership on the Ethereum ledger.",
    size: "col-span-12 md:col-span-4",
    bg: "bg-purple-500/5"
  },
  {
    icon: BadgeCheck,
    title: "Authority Verified",
    description: "Government-approved digital signatures valid for all legal transfers.",
    size: "col-span-12 md:col-span-8",
    bg: "bg-teal-500/5"
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Peer-to-peer property transfers without intermediaries.",
    size: "col-span-12 md:col-span-6",
    bg: "bg-orange-500/5"
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Complete chain of custody viewable by anyone, anywhere.",
    size: "col-span-12 md:col-span-6",
    bg: "bg-indigo-500/5"
  }
]

export function FeaturesSection() {
  return (
    <section className="relative py-24 bg-[#0f1513]">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16">
          <BadgeCheck className="w-10 h-10 text-emerald-400 mb-4" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
            Architecture for <span className="text-emerald-400 font-mono">Immutable</span> Trust.
          </h2>
          <p className="max-w-2xl text-slate-500 font-medium">
            We've combined the power of Ethereum, Pinata IPFS, and Gemini AI to create the world's most resilient property registry.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${feature.size} group relative rounded-[32px] border border-white/5 ${feature.bg} p-8 backdrop-blur-xl transition-all hover:border-emerald-500/30 overflow-hidden`}
            >
              {/* Interactive Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 border border-white/10 group-hover:scale-110 transition-transform shadow-2xl">
                    <feature.icon className="h-7 w-7 text-emerald-400" />
                  </div>
                  <h3 className="mb-3 text-2xl font-black tracking-tight text-white">{feature.title}</h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-[280px]">
                    {feature.description}
                  </p>
                </div>
                
                {/* Decorative Element for larger cards */}
                {feature.size.includes('col-span-8') && (
                   <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(j => (
                           <div key={j} className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                         ))}
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400/50">Enterprise Ready</span>
                   </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
