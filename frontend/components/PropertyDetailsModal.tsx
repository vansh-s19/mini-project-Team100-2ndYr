"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { 
  MapPin, 
  Maximize2, 
  Home, 
  FileText, 
  Image as ImageIcon, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"

interface PropertyDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: number
  registryId: string
  ipfsHash: string
  ownerName: string
}

interface PropertyMetadata {
  location: {
    address: string
    lat: string
    lng: string
    state: string
    district: string
  }
  details: {
    propertyType: string
    residentialSubType: string
    bhk: string
    area: string
    unit: string
    status: string
    ownershipType: string
    furnishedStatus: string
  }
  documents: {
    saleDeed: string
    ec: string
    khata: string
  }
  images: string[]
}

const GATEWAY = "https://gateway.pinata.cloud/ipfs/"

export function PropertyDetailsModal({ 
  isOpen, 
  onClose, 
  propertyId, 
  registryId, 
  ipfsHash,
  ownerName
}: PropertyDetailsModalProps) {
  const [metadata, setMetadata] = useState<PropertyMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && ipfsHash) {
      fetchMetadata()
    } else {
      setMetadata(null)
      setError(null)
    }
  }, [isOpen, ipfsHash])

  const fetchMetadata = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${GATEWAY}${ipfsHash}`)
      setMetadata(response.data)
    } catch (err) {
      console.error("Error fetching metadata:", err)
      setError("Failed to fetch property details from IPFS. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-y-auto bg-[#020617] border-white/10 text-slate-200">
        <DialogHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              #{propertyId}
            </Badge>
            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight">
              {registryId || "OFFICIAL REGISTRY"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 font-medium">
            Registered by <span className="text-white font-bold">{ownerName}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-4" />
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Decrypting IPFS Metadata...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-400 font-bold">{error}</p>
            <Button onClick={fetchMetadata} variant="outline" className="mt-4 border-white/10">Retry</Button>
          </div>
        ) : metadata ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 py-6"
          >
            {/* Location Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Geospatial Data</h4>
              </div>
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5">
                <p className="text-lg font-bold text-white mb-4">{metadata.location.address}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">District</p>
                    <p className="text-sm font-bold">{metadata.location.district}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">State</p>
                    <p className="text-sm font-bold">{metadata.location.state}</p>
                  </div>
                  <div className="col-span-2">
                    <Button 
                      asChild
                      variant="outline" 
                      className="w-full mt-2 rounded-xl border-white/5 bg-white/5 hover:bg-emerald-600 hover:text-white transition-all gap-2"
                    >
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${metadata.location.lat},${metadata.location.lng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Verify on Geospatial Map
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Specs Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Maximize2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Asset Specifications</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Property Type", value: metadata.details.propertyType, icon: Home },
                  { label: "BHK / Layout", value: `${metadata.details.bhk} BHK`, icon: Home },
                  { label: "Total Area", value: `${metadata.details.area} ${metadata.details.unit}`, icon: Maximize2 },
                  { label: "Legality", value: metadata.details.ownershipType, icon: ShieldCheck },
                ].map((spec) => (
                  <div key={spec.label} className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                    <spec.icon className="w-4 h-4 text-emerald-400/50 mb-3" />
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">{spec.label}</p>
                    <p className="text-xs font-bold text-white">{spec.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Documents Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Legal Vault</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Sale Deed", hash: metadata.documents.saleDeed },
                  { label: "Encumbrance Cert.", hash: metadata.documents.ec },
                  { label: "Khata / Patta", hash: metadata.documents.khata }
                ].map((doc) => (
                  <Button 
                    key={doc.label}
                    asChild
                    variant="ghost" 
                    className="h-auto py-4 px-4 rounded-2xl bg-secondary/20 border border-white/5 hover:border-emerald-500/30 flex flex-col items-start gap-1"
                  >
                    <a href={`${GATEWAY}${doc.hash}`} target="_blank" rel="noopener noreferrer">
                      <p className="text-[10px] text-slate-500 uppercase font-black">{doc.label}</p>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-mono text-emerald-400/70 truncate w-32">{doc.hash}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </div>
                    </a>
                  </Button>
                ))}
              </div>
            </section>

            {/* Images Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Property Imagery</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metadata.images.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 group">
                    <img 
                      src={`${GATEWAY}${img}`} 
                      alt={`Property ${i+1}`} 
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                       <p className="text-[8px] font-black uppercase text-white tracking-widest">Attachment 0{i+1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
