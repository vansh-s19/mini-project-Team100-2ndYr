"use client"
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return position.lat !== "" && position.lng !== "" ? <Marker position={[Number(position.lat), Number(position.lng)]}></Marker> : null
}

export default function PinMap({ lat, lng, setLat, setLng }: any) {
  const [mounted, setMounted] = useState(false)
  
  // Need to force re-render/center when coordinates change substantially from external geocode
  const [center, setCenter] = useState<[number, number]>([23.5937, 78.9629])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (lat && lng) {
        setCenter([Number(lat), Number(lng)])
    }
  }, [lat, lng])

  if (!mounted) return <div className="h-48 w-full bg-secondary/50 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-500 uppercase font-black">Loading Map...</div>

  return (
    <div className="h-48 w-full rounded-2xl overflow-hidden border border-border/50 relative z-0">
      <MapContainer key={`${center[0]}-${center[1]}`} center={center} zoom={lat && lng ? 15 : 5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker position={{lat, lng}} setPosition={({lat, lng}: any) => { setLat(lat.toString()); setLng(lng.toString()); }} />
      </MapContainer>
    </div>
  )
}
