"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, User, Maximize2, MapPin } from 'lucide-react'

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
}

export default function PropertyMap({ properties }: { properties: Property[] }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="w-full h-full bg-[#0f1513]/50 animate-pulse rounded-3xl border border-border/50 flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-widest">Initialising Geo Ledger...</div>

  return (
    <div className="w-full h-full relative rounded-[40px] overflow-hidden border border-border/50 shadow-2xl">
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
          <Marker 
            key={idx} 
            position={[prop.lat, prop.lng]}
          >
            <Popup className="premium-popup">
              <div className="p-6 w-[280px] bg-[#0f1513]/95 text-white rounded-[32px] border border-border/50 backdrop-blur-3xl shadow-2xl overflow-hidden relative group">
                {/* Header with Title & Badge */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-sm uppercase tracking-tight truncate max-w-[170px]">{prop.name || "DECENTRALIZED ASSET"}</h3>
                  <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase text-emerald-400">
                    LIVE
                  </div>
                </div>

                {/* Price Display: Side-by-Side Comparison */}
                <div className="mb-5 p-4 rounded-2xl bg-secondary/30 border border-border/50 group-hover:border-emerald-500/20 transition-all">
                   <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Actual Price</p>
                        <span className="text-xl font-black text-emerald-400">₹{prop.actual_price}L</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Predicted</p>
                        <span className="text-sm font-bold text-slate-300">₹{prop.predicted_price}L</span>
                      </div>
                   </div>
                   
                   <div className="pt-2 border-t border-border/30 flex justify-between items-center">
                      <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">AI Margin Analysis</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${prop.profit_margin >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {prop.profit_margin >= 0 ? '+' : ''}{prop.profit_margin}%
                      </span>
                   </div>
                </div>

                {/* Parameter Details */}
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center border border-border">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prop.city}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center border border-border">
                      <Maximize2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prop.area} sq ft</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center border border-border">
                      <Home className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prop.type} • {prop.bedrooms} BHK</span>
                  </div>
                </div>

                {/* Footer Chip */}
                <div className="mt-5 pt-4 border-t border-border/50">
                   <div className="flex items-center justify-between">
                     <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest leading-none">
                        Registry Ref: <span className="text-slate-400 font-mono">#{idx + 1024}</span>
                     </span>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                   </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          background: #0f1513 !important;
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          color: white !important;
          border: none !important;
          border-radius: 32px !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: #0f1513 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: none !important;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          top: 16px !important;
          right: 16px !important;
          font-size: 20px !important;
          z-index: 100 !important;
        }
      `}</style>
    </div>
  )
}
