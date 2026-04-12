"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-cluster'
import axios from 'axios'
import { TrendingUp, Activity, Sparkles, Loader2, AlertCircle } from 'lucide-react'

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// ── Custom SVG markers ──
function createIcon(color: string, size: number, glow: boolean) {
  const glowFilter = glow
    ? `<filter id="g"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="${color}" flood-opacity="0.6"/></filter>`
    : ''
  const filterAttr = glow ? 'filter="url(#g)"' : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="${size}" height="${Math.round(size * 1.375)}">
    <defs>${glowFilter}
      <linearGradient id="gr" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1"/>
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.75"/>
      </linearGradient>
    </defs>
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z"
          fill="url(#gr)" ${filterAttr} stroke="white" stroke-width="1.5"/>
    <circle cx="16" cy="15" r="5.5" fill="white" opacity="0.95"/>
    <circle cx="16" cy="15" r="2.5" fill="${color}"/>
  </svg>`
  return L.icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: [size, Math.round(size * 1.375)],
    iconAnchor: [size / 2, Math.round(size * 1.375)],
    popupAnchor: [0, -Math.round(size * 1.375) - 2],
  })
}

// Real = larger, glowing | Mock = smaller, muted
const icons = {
  real_buy: createIcon('#059669', 36, true),
  real_rent: createIcon('#2563eb', 36, true),
  mock_buy: createIcon('#6b7280', 24, false),
  mock_rent: createIcon('#6b7280', 24, false),
  selected: createIcon('#f59e0b', 40, true),
}

export interface PropertyData {
  ownerName: string
  bhk: string
  sqft: number
  status: string
  propertyName: string
  address: string
  city: string
  furnished: string
  type: string
  pricePerSqft: number
  lat: number
  lng: number
  category: string
  source: string
}

function getIcon(p: PropertyData, isSelected: boolean) {
  if (isSelected) return icons.selected
  if (p.source === 'real') return p.category === 'Buying' ? icons.real_buy : icons.real_rent
  return p.category === 'Buying' ? icons.mock_buy : icons.mock_rent
}

// ── FlyTo on selection ──
function FlyToSelected({ prop }: { prop: PropertyData | null }) {
  const map = useMap()
  useEffect(() => {
    if (prop && prop.lat && prop.lng) {
      map.flyTo([prop.lat, prop.lng], 14, { duration: 1 })
    }
  }, [prop, map])
  return null
}

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

export default function PropertyMap({
  properties,
  selectedProperty,
  onSelectProperty,
}: {
  properties: PropertyData[]
  selectedProperty: PropertyData | null
  onSelectProperty: (p: PropertyData) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [roiCache, setRoiCache] = useState<Record<string, any>>({})

  useEffect(() => { setMounted(true) }, [])

  const fetchROI = async (p: PropertyData) => {
    if (roiCache[p.propertyName]) return

    setRoiCache(prev => ({ ...prev, [p.propertyName]: { loading: true } }))
    try {
      const response = await axios.post('http://localhost:5001/api/ai/estimate-roi', { property: p })
      setRoiCache(prev => ({ ...prev, [p.propertyName]: { ...response.data, loading: false } }))
    } catch (error) {
      console.error("ROI Fetch Error:", error)
      setRoiCache(prev => ({ ...prev, [p.propertyName]: { loading: false, error: true } }))
    }
  }

  if (!mounted) return (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-2xl animate-pulse">
      <span className="text-slate-400 text-sm font-medium">Loading Map…</span>
    </div>
  )

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200/50">
      <MapContainer
        center={[23.5, 78.9]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FlyToSelected prop={selectedProperty} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount()
            let size = 'small'
            if (count > 20) size = 'large'
            else if (count > 10) size = 'medium'
            return L.divIcon({
              html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
              className: 'custom-cluster',
              iconSize: L.point(40, 40),
            })
          }}
        >
          {properties.map((p, i) => {
            if (!p.lat || !p.lng) return null;
            const isSelected = selectedProperty?.lat === p.lat && selectedProperty?.lng === p.lng && selectedProperty?.propertyName === p.propertyName
            return (
              <Marker
                key={`${p.propertyName}-${p.lat}-${i}`}
                position={[p.lat, p.lng]}
                icon={getIcon(p, isSelected)}
                eventHandlers={{
                  click: () => {
                    onSelectProperty(p)
                    fetchROI(p)
                  },
                }}
              >
                <Popup className="property-popup" maxWidth={300} minWidth={260}>
                  <div className="pp-card">
                    <div className="pp-head">
                      <div className="pp-head-l">
                        <h3 className="pp-title">{p.propertyName}</h3>
                        <p className="pp-addr">{p.address}</p>
                      </div>
                      <span className={`pp-badge ${p.source === 'real' ? 'pp-real' : 'pp-mock'}`}>
                        {p.source === 'real' ? '⭐ Verified' : '📋 Listed'}
                      </span>
                    </div>
                    <div className="pp-price-row">
                      <span className="pp-total">{formatPrice(p.sqft * p.pricePerSqft)}</span>
                      <span className="pp-sqft">₹{p.pricePerSqft.toLocaleString('en-IN')}/sqft</span>
                    </div>
                    <div className="pp-details">
                      <span>👤 {p.ownerName}</span>
                      <span>🛏️ {p.bhk}</span>
                      <span>📐 {p.sqft.toLocaleString()} sqft</span>
                      <span>🏢 {p.type}</span>
                      <span>🪑 {p.furnished}</span>
                      <span>{p.status === 'Ready to Move' ? '✅' : '🔨'} {p.status}</span>
                    </div>

                    {/* Simple ROI Section */}
                    <div className="pp-roi-box">
                      <div className="pp-roi-header">
                        <Activity className="pp-roi-icon" />
                        <span className="pp-roi-title">ROI Analysis</span>
                      </div>
                      
                      {roiCache[p.propertyName]?.loading ? (
                        <div className="pp-roi-loading">
                          <Loader2 className="pp-roi-spinner" />
                          <span>Calculating market ROI...</span>
                        </div>
                      ) : roiCache[p.propertyName]?.error ? (
                        <div className="pp-roi-error">
                          <AlertCircle className="pp-roi-error-icon" />
                          <span>Analysis unavailable</span>
                        </div>
                      ) : roiCache[p.propertyName] ? (
                        <div className="pp-roi-content">
                          <div className="pp-roi-stats">
                            <div className="pp-roi-stat">
                              <TrendingUp className="pp-stat-icon text-emerald-500" />
                              <div className="pp-stat-vals">
                                <span className="pp-stat-label">5yr Return</span>
                                <span className="pp-stat-val">+{roiCache[p.propertyName].roi_pct}%</span>
                              </div>
                            </div>
                            <div className="pp-roi-stat">
                              <Activity className="pp-stat-icon text-blue-500" />
                              <div className="pp-stat-vals">
                                <span className="pp-stat-label">Rental Yield</span>
                                <span className="pp-stat-val">{roiCache[p.propertyName].yield_pct}%/yr</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="pp-roi-hint">Click marker to see ROI estimation</p>
                      )}
                    </div>
                    <div className="pp-foot">
                      <span className="pp-city">📍 {p.city}</span>
                      <span className={`pp-cat ${p.category === 'Buying' ? 'pp-buy' : 'pp-rent'}`}>
                        {p.category === 'Buying' ? '🏠 Buy' : '🔑 Rent'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>

      <style jsx global>{`
        .leaflet-container { background: #f1f5f9 !important; font-family: 'Inter', system-ui, sans-serif; }

        /* Cluster styles */
        .custom-cluster { background: none !important; }
        .cluster-icon {
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; font-weight: 800; font-size: 12px; color: white;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .cluster-small { width: 36px; height: 36px; background: #059669; }
        .cluster-medium { width: 42px; height: 42px; background: #0d9488; font-size: 13px; }
        .cluster-large { width: 50px; height: 50px; background: #0f766e; font-size: 14px; }

        /* Popup */
        .leaflet-popup-content-wrapper {
          background: #fff !important; border-radius: 16px !important;
          padding: 0 !important; box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important; overflow: hidden;
        }
        .leaflet-popup-content { margin: 0 !important; line-height: 1.5 !important; }
        .leaflet-popup-tip { background: #fff !important; }
        .leaflet-popup-close-button {
          color: #94a3b8 !important; top: 10px !important; right: 12px !important;
          font-size: 20px !important; z-index: 10 !important;
        }

        .pp-card { padding: 16px; width: 260px; }
        .pp-head { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
        .pp-head-l { min-width: 0; flex: 1; }
        .pp-title { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pp-addr { font-size: 11px; color: #94a3b8; margin: 0; }
        .pp-badge { font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 50px; white-space: nowrap; }
        .pp-real { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .pp-mock { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
        .pp-price-row {
          display: flex; justify-content: space-between; align-items: baseline;
          padding: 10px 12px; background: #f8fafc; border-radius: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0;
        }
        .pp-total { font-size: 18px; font-weight: 900; color: #0f172a; }
        .pp-sqft { font-size: 10px; color: #64748b; font-weight: 600; }
        .pp-details {
          display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 10px;
          font-size: 11px; color: #475569; font-weight: 500;
        }
        .pp-details span { padding: 5px 8px; background: #f8fafc; border-radius: 8px; }

        /* ROI Styles */
        .pp-roi-box {
          margin: 12px 0; padding: 12px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          border: 1px solid #d1fae5; border-radius: 12px;
        }
        .pp-roi-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
        .pp-roi-icon { width: 14px; height: 14px; color: #059669; }
        .pp-roi-title { font-size: 11px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .pp-roi-loading { display: flex; align-items: center; gap: 8px; font-size: 10px; color: #059669; font-weight: 600; }
        .pp-roi-spinner { width: 12px; height: 12px; animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .pp-roi-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
        .pp-roi-stat { display: flex; align-items: center; gap: 6px; padding: 6px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
        .pp-stat-icon { width: 12px; height: 12px; }
        .pp-stat-vals { display: flex; flex-direction: column; }
        .pp-stat-label { font-size: 8px; color: #64748b; font-weight: 700; text-transform: uppercase; }
        .pp-stat-val { font-size: 12px; color: #0f172a; font-weight: 900; line-height: 1; margin-top: 1px; }
        
        .pp-roi-insight { font-size: 10px; color: #065f46; font-weight: 500; font-style: italic; line-height: 1.4; margin: 0; opacity: 0.9; }
        .pp-roi-hint { font-size: 10px; color: #94a3b8; font-style: italic; text-align: center; margin: 0; }
        .pp-roi-error { display: flex; align-items: center; gap: 6px; color: #dc2626; font-size: 9px; font-weight: 600; }
        .pp-roi-error-icon { width: 12px; height: 12px; }

        .pp-foot { display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #f1f5f9; }
        .pp-city { font-size: 11px; font-weight: 700; color: #475569; padding: 4px 10px; background: #f1f5f9; border-radius: 50px; }
        .pp-cat { font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 50px; }
        .pp-buy { background: #ecfdf5; color: #059669; }
        .pp-rent { background: #eff6ff; color: #2563eb; }

        /* Marker hover - subtle brightness only, NO transform to avoid anchor shift */
        .leaflet-marker-icon { transition: filter 0.2s ease !important; }
        .leaflet-marker-icon:hover { filter: brightness(1.3) drop-shadow(0 0 6px rgba(16,185,129,0.4)) !important; z-index: 10000 !important; }

        /* Zoom controls */
        .leaflet-control-zoom a {
          background: #fff !important; color: #475569 !important; border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important; width: 34px !important; height: 34px !important; line-height: 34px !important;
        }
        .leaflet-control-zoom { border: none !important; border-radius: 12px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important; }
      `}</style>
    </div>
  )
}
