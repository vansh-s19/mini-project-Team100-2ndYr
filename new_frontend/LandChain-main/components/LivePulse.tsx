"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Database, Globe } from "lucide-react"

export function LivePulse() {
  return (
    <div className="w-full py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="relative p-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-[40px] overflow-hidden">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl rounded-[39px] -z-10" />
          
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative">
            
            {/* Left: Stats & Pulse */}
            <div className="flex-1 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Live Sync Active
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  Real-time Ledger <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Synchronization.</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Shield, label: "Trust Score", value: "99.9%" },
                  { icon: Database, label: "Nodes", value: "1,204" },
                  { icon: Zap, label: "Latency", value: "12ms" },
                  { icon: Globe, label: "Region", value: "Global" }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <stat.icon className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className="text-xl font-black text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dynamic Visualization */}
            <div className="flex-1 w-full max-w-md h-48 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                 <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                 <div className="absolute w-64 h-64 border border-blue-500/30 rounded-full animate-ping" />
              </div>

              <div className="relative flex items-center gap-8">
                {/* Node Icons with Packets */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                    <Database className="w-8 h-8 text-blue-400" />
                  </div>
                  
                  {/* Moving Packets */}
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      initial={{ left: 0, opacity: 0 }}
                      animate={{ 
                        left: ["0%", "100%"], 
                        opacity: [0, 1, 0],
                        scale: [1, 1.5, 1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3, 
                        delay: i * 1,
                        ease: "easeInOut" 
                      }}
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full blur-[2px] z-10"
                    />
                  ))}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                  <Globe className="w-8 h-8 text-indigo-400" />
                </div>
              </div>

              {/* Glowing Background Glows */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
