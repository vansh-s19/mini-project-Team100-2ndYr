"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, User, Maximize2, MapPin, ShieldCheck, Sparkles } from 'lucide-react'

// Fix for default icon set in Leaflet + React
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Property {
  name: string
  lat: number
  lng: number
  city: string
  area: number
  type: string
  furnish_status: string
  bedrooms: number
  actual_price: number
  predicted_price: number
  profit_margin: number
  isVerified?: boolean
}

export default function PropertyMap({ properties }: { properties: Property[] }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="w-full h-full bg-[#0f1513]/50 animate-pulse rounded-3xl border border-border/50 flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-widest">Initialising Geo Ledger...</div>

  // Helper to calculate circle radius (approximate for visualization)
  const getRadius = (area: number) => Math.sqrt(area) * 2

  return (
    <div className="w-full h-full relative rounded-[40px] overflow-hidden border border-border/50 shadow-2xl group">
      {/* Map Overlay: Grid Pulse */}
      <div className="absolute inset-0 pointer-events-none z-10 border-[20px] border-[#0f1513] opacity-20" />
      
      <MapContainer
        center={[23.5937, 78.9629]} // Center of India
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          detectRetina={true}
        />
        
        {properties.map((prop, idx) => (
          <LayerGroup key={idx}>
            {/* The Plot Outline Circle */}
            <Circle 
              center={[prop.lat, prop.lng]}
              radius={getRadius(prop.area || 1000)}
              pathOptions={{ 
                color: prop.isVerified ? '#10b981' : '#f59e0b', 
                fillColor: prop.isVerified ? '#10b981' : '#f59e0b', 
                fillOpacity: 0.15,
                weight: 1,
                dashArray: '5, 5'
              }}
            />

            <Marker 
              position={[prop.lat, prop.lng]}
            >
              <Popup className="premium-popup">
                <div className="p-6 w-[280px] bg-[#0f1513]/95 text-white rounded-[32px] border border-border/50 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-transparent" />
                  
                  {/* Header with Title & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-black text-sm uppercase tracking-tight truncate max-w-[170px]">{prop.name || "DECENTRALIZED ASSET"}</h3>
                    <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase flex items-center gap-1 ${prop.isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                      {prop.isVerified ? <ShieldCheck className="w-2 h-2" /> : <Sparkles className="w-2 h-2" />}
                      {prop.isVerified ? 'Verified' : 'Pending'}
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="mb-5 p-4 rounded-2xl bg-secondary/30 border border-border/50">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Blockchain Value</p>
                          <span className="text-xl font-black text-emerald-400">₹{prop.actual_price}L</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">AI Margin</p>
                          <span className={`text-sm font-bold ${prop.profit_margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {prop.profit_margin >= 0 ? '+' : ''}{prop.profit_margin}%
                          </span>
                        </div>
                    </div>
                  </div>

                  {/* Parameter Details */}
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center border border-border">
                        <Maximize2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prop.area} SQ FT AREA</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center border border-border">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{prop.city}</span>
                    </div>
                  </div>

                  {/* Footer Chip */}
                  <div className="mt-5 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest leading-none">
                          Ledger Sync: <span className="text-emerald-500 font-mono">STABLE</span>
                      </span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </LayerGroup>
        ))}
      </MapContainer>

      {/* Floating Map Controls Legend */}
      <div className="absolute top-6 right-6 z-20 space-y-2">
         <div className="p-3 bg-secondary/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Verified Deed</span>
         </div>
         <div className="p-3 bg-secondary/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Awaiting Auth</span>
         </div>
      </div>

      <style jsx global>{`
        .premium-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          color: white !important;
          border: none !important;
          border-radius: 32px !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .premium-popup .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .premium-popup .leaflet-popup-tip {
          background: #0f1513 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-container {
          background: #0f1513 !important;
        }
      `}</style>
    </div>
  )
}
