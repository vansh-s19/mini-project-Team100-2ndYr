"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, HardDrive, Loader2, ShieldCheck, Sparkles, MapPin, Image as ImageIcon } from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"

const PinMap = dynamic(() => import("@/components/PinMap"), { ssr: false, loading: () => <div className="h-48 w-full bg-secondary/50 rounded-2xl animate-pulse" /> })

const BACKEND_URL = "http://localhost:5001"

interface ExtractedData {
  ownerNames: string
  plotNumber: string
  registryId: string
  address: string
  area: string
  lat: string
  lng: string
  state: string
  district: string
  propertyType: string
  residentialSubType: string
  bhk: string
  unit: string
  propertyStatus: string
  ownershipType: string
  furnishedStatus: string
}

export default function RegisterPropertyPage() {
  const { contract, isConnected, account } = useWeb3()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [saleDeed, setSaleDeed] = useState<File | null>(null)
  const [ecFile, setEcFile] = useState<File | null>(null)
  const [khataFile, setKhataFile] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])

  const [isProcessing, setIsProcessing] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [ipfsHash, setIpfsHash] = useState("")

  // Auth Guard logic (Login only)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])





  const [formData, setFormData] = useState<ExtractedData>({
    ownerNames: "",
    plotNumber: "",
    registryId: "",
    address: "",
    area: "",
    lat: "",
    lng: "",
    state: "",
    district: "",
    propertyType: "Residential",
    residentialSubType: "",
    bhk: "",
    unit: "sqft",
    propertyStatus: "Ready to Move",
    ownershipType: "Freehold",
    furnishedStatus: ""
  })

  if (authLoading) return (
    <div className="min-h-screen bg-[#0f1513] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
  )

  // ───────────────────────── Logic ─────────────────────────

  const handleSaleDeedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    setSaleDeed(selectedFile)
    
    const isImage = selectedFile.type.startsWith("image/")
    if (!isImage) {
      console.log("ℹ️ OCR skipped for non-image file.")
      return
    }

    setIsProcessing(true)

    try {
      const formPayload = new FormData()
      formPayload.append("document", selectedFile)

      const response = await axios.post(`${BACKEND_URL}/api/ocr/extract`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (response.data.success) {
        const fields = response.data.fields
        setFormData(prev => ({
          ...prev,
          ownerNames: fields.ownerName || prev.ownerNames,
          plotNumber: fields.plotNumber || prev.plotNumber,
          registryId: fields.registryId || prev.registryId,
          address: fields.address || prev.address,
          area: fields.area || prev.area
        }))
      }
    } catch (error: any) {
      console.error("OCR Error:", error)
      const errorMsg = error.response?.data?.message || error.message
      if (errorMsg.includes("Only images are allowed")) {
         console.warn("⚠️ OCR failed: Only images are supported for auto-fill.")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setter(selectedFile)
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleInputChange = (field: keyof ExtractedData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGeocode = async () => {
    if (!formData.address) {
      alert("Please enter an address first.");
      return;
    }
    setIsGeocoding(true);
    try {
      const resp = await axios.post(`${BACKEND_URL}/api/property/geocode`, { address: formData.address });
      if (resp.data.lat && resp.data.lng) {
        setFormData(prev => ({ ...prev, lat: resp.data.lat, lng: resp.data.lng }));
      }
    } catch(err) {
      console.error("Geocoding error", err);
      alert("Geocoding failed. Please verify the address.");
    } finally {
      setIsGeocoding(false);
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || !isConnected) {
      alert("Please connect your wallet first!")
      return
    }
    if (!saleDeed) {
      alert("Please upload the Sale Deed document.")
      return
    }
    if (!formData.lat || !formData.lng) {
      alert("Please set a location pin on the map or geocode your address.")
      return
    }
    if (Number(formData.area) <= 0 || isNaN(Number(formData.area))) {
      alert("Area must be greater than 0.")
      return
    }

    setIsRegistering(true)
    console.log("🚀 Starting Registration Flow...")
    try {
      // Step 1: Upload to Backend (Metadata Route)
      console.log("  → Step 1: Uploading Metadata to IPFS via Backend...");
      const formPayload = new FormData()
      
      formPayload.append("saleDeed", saleDeed)
      if (ecFile) formPayload.append("ec", ecFile)
      if (khataFile) formPayload.append("khata", khataFile)
      images.forEach(img => formPayload.append("images", img))
      
      // Append text fields
      Object.keys(formData).forEach(key => formPayload.append(key, formData[key as keyof ExtractedData]))
      
      const ipfsResponse = await axios.post(`${BACKEND_URL}/api/property/register-property`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      
      const cid = ipfsResponse.data.metadataHash
      console.log(`  ✅ IPFS Metadata Success! CID: ${cid}`);
      setIpfsHash(cid)

      // Step 2: Register on blockchain
      console.log("  → Step 2: Initiating Blockchain Transaction...");
      console.log("    Params:", {
        regId: formData.registryId,
        cid: cid,
        owner: formData.ownerNames,
        plot: formData.plotNumber,
        area: formData.area,
        addr: formData.address
      });

      const tx = await contract.registerProperty(
        formData.registryId,
        cid,
        formData.ownerNames,
        formData.plotNumber,
        formData.area,
        formData.address
      )
      
      console.log("  ⏳ Transaction Sent! Hash:", tx.hash);
      console.log("  → Step 3: Waiting for Block Confirmation...");
      
      const receipt = await tx.wait()
      console.log("  ✅ Transaction Confirmed!", receipt);

      // New: Sync Blockchain ID back to Database
      try {
        const event = receipt.events?.find((e: any) => e.event === "PropertyRegistered")
        const newBlockchainId = event?.args?.propertyId?.toString()
        
        if (newBlockchainId) {
          console.log(`  🔗 Syncing Blockchain ID ${newBlockchainId} to Database...`)
          await axios.patch(`${BACKEND_URL}/api/property/sync-blockchain-id`, {
            registryId: formData.registryId,
            blockchainId: newBlockchainId
          })
          console.log("  ✅ Database Sync Complete!")
        }
      } catch (syncErr: any) {
        console.warn("  ⚠️ Sync failed (ignoring):", syncErr.message)
      }
      
      setIsRegistered(true)
    } catch (error: any) {
      console.error("❌ Registration error:", error)
      
      let errorMsg = "Registration failed."
      if (error.code === 4001 || error.message?.includes("user rejected")) {
        errorMsg = "Transaction was rejected in MetaMask."
      } else if (error.reason) {
        errorMsg = `Contract Reverted: ${error.reason}`
      } else if (error.message) {
        errorMsg = error.message
      }
      
      alert(errorMsg)
    } finally {
      setIsRegistering(false)
    }
  }

  // ───────────────────────── Render Success ─────────────────────────

  if (isRegistered) {
    return (
      <main className="min-h-screen bg-[#0f1513] text-white">
        <Header />
        <div className="pt-40 pb-20 px-4 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm rounded-[40px] p-8 text-center border overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black mb-4">Registry Secured.</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">The property metadata has been successfully hashed and anchored to the Ethereum Ledger.</p>
              
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50 mb-8 space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  <span>Metadata CID</span>
                  <span className="text-emerald-400 font-mono">{ipfsHash.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  <span>Registry ID</span>
                  <span className="text-emerald-400 font-mono">{formData.registryId}</span>
                </div>
              </div>

              <Button onClick={() => window.location.reload()} className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-2xl py-6 font-bold shadow-lg shadow-emerald-500/20">
                Register Another
              </Button>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </main>
    )
  }

  // Helper component for uploads
  const FileUploadCard = ({ title, desc, file, onChange, isProcessing, accept = "image/*,.pdf", multiple = false }: any) => (
      <div className="relative group w-full mb-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[30px] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div className={`relative p-6 rounded-[30px] bg-card/50 border-2 border-dashed ${file ? "border-emerald-500/40" : "border-border/50"} backdrop-blur-sm transition-all flex flex-col items-center justify-center min-h-[160px]`}>
          <input type="file" accept={accept} onChange={onChange} multiple={multiple} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          
          {isProcessing ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
              <h3 className="font-bold text-sm text-emerald-400">Scanning {title}...</h3>
            </div>
          ) : (file && (!multiple || file.length > 0)) ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-border">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="font-bold text-xs text-emerald-400 truncate max-w-[150px]">{multiple ? `${file.length} files selected` : file.name}</p>
              <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Loaded</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-border group-hover:border-emerald-500/30 transition-all shadow-inner">
                 {multiple ? <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-all" /> : <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-all" />}
              </div>
              <h3 className="font-bold text-sm mb-1">{title} </h3>
              <p className="text-[10px] text-slate-500">{desc}</p>
            </div>
          )}
        </div>
      </div>
  )

  // ───────────────────────── Main Render ─────────────────────────

  const selectClasses = "bg-secondary/50 border border-border/50 rounded-2xl p-4 w-full focus:border-emerald-500/50 transition-all text-sm outline-none text-white appearance-none";

  return (
    <main className="min-h-screen bg-[#0f1513] text-white">
      <Header />
      
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Initiate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Property Registry.</span></h1>
            <p className="text-slate-400 max-w-xl mx-auto leading-relaxed text-lg">Secure your property attributes and documents on-chain.</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Upload */}
            <div className="lg:col-span-5 space-y-4">
               <h3 className="text-lg font-black tracking-tight mb-2 uppercase text-slate-300">Required Documents</h3>
               
               <FileUploadCard 
                 title="Sale Deed (Required)" 
                 desc="PDF, PNG or JPG (Max 10MB)" 
                 file={saleDeed} 
                 onChange={handleSaleDeedChange} 
                 isProcessing={isProcessing} 
               />
               
               <h3 className="text-lg font-black tracking-tight mb-2 mt-6 uppercase text-slate-300">Supporting Records</h3>
               <div className="grid grid-cols-2 gap-4">
                  <FileUploadCard 
                    title="Encumbrance (EC)" 
                    desc="Optional (PDF/Image)" 
                    file={ecFile} 
                    onChange={(e: any) => handleFileChange(e, setEcFile)} 
                  />
                  <FileUploadCard 
                    title="Khata" 
                    desc="Optional (PDF/Image)" 
                    file={khataFile} 
                    onChange={(e: any) => handleFileChange(e, setKhataFile)} 
                  />
               </div>

               <h3 className="text-lg font-black tracking-tight mb-2 mt-2 uppercase text-slate-300">Property Imagery</h3>
               <FileUploadCard 
                 title="Images" 
                 desc="Select multiple images" 
                 file={images} 
                 onChange={handleImagesChange}
                 multiple={true}
                 accept="image/*"
               />

              <div className="p-6 rounded-3xl bg-secondary/30 border border-border/50 flex gap-4 backdrop-blur-sm mt-4">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Uploading the Sale Deed unlocks OCR auto-fill for basic property details.
                </p>
              </div>
            </div>

            {/* Right Column: Form Fields */}
            <div className="lg:col-span-7">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm rounded-[40px] p-8 border">
                <div className="space-y-6">
                  
                  {/* Basic Details */}
                  <div className="space-y-4 border-b border-border/50 pb-6">
                      <h4 className="font-bold text-sm text-emerald-400 uppercase tracking-widest">Base Identity</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">SRO Deed Number / Reg ID *</Label>
                          <Input value={formData.registryId} onChange={(e) => handleInputChange("registryId", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-6 focus:border-emerald-500/50 transition-all font-mono" placeholder="e.g. 2024/8829" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Khasra / Survey Number *</Label>
                            <Input value={formData.plotNumber} onChange={(e) => handleInputChange("plotNumber", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-6 focus:border-emerald-500/50 transition-all font-mono" placeholder="e.g. 402/B" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Full Name of Owner(s) *</Label>
                        <Input value={formData.ownerNames} onChange={(e) => handleInputChange("ownerNames", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-6 focus:border-emerald-500/50 transition-all" placeholder="John Doe" required />
                      </div>
                  </div>

                  {/* Address & Geocoding */}
                  <div className="space-y-4 border-b border-border/50 pb-6">
                      <h4 className="font-bold text-sm text-emerald-400 uppercase tracking-widest">Location Information</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Property Address *</Label>
                            {formData.lat && formData.lng && <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded">✓ {Number(formData.lat).toFixed(3)}, {Number(formData.lng).toFixed(3)}</span>}
                        </div>
                        <div className="flex gap-2">
                            <Input value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-6 focus:border-emerald-500/50 transition-all font-mono flex-1" placeholder="123 Emerald Street, Green City" required />
                            <Button type="button" onClick={handleGeocode} disabled={isGeocoding} className="rounded-2xl bg-secondary hover:bg-secondary/80 text-white h-12 w-12 flex items-center justify-center p-0">
                                {isGeocoding ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                            </Button>
                        </div>
                        <p className="text-[10px] text-slate-500 ml-1">Geocode the address or click on the map to pin exact coordinates.</p>
                      </div>

                      {/* Interactive Map Pin */}
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Pin Location on Map</Label>
                        <PinMap
                          lat={formData.lat}
                          lng={formData.lng}
                          setLat={(v: string) => handleInputChange("lat", v)}
                          setLng={(v: string) => handleInputChange("lng", v)}
                        />
                        <p className="text-[10px] text-slate-500 ml-1">Click anywhere on the map to set the exact property location.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">State</Label>
                            <select className={selectClasses} value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)}>
                                <option value="">Select State</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Karnataka">Karnataka</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Gujarat">Gujarat</option>
                                <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">District</Label>
                            <Input value={formData.district} onChange={(e) => handleInputChange("district", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-[14px] focus:border-emerald-500/50 transition-all text-sm" placeholder="e.g. Pune" />
                          </div>
                      </div>
                  </div>

                  {/* Advanced Configuration */}
                  <div className="space-y-4">
                      <h4 className="font-bold text-sm text-emerald-400 uppercase tracking-widest">Metadata Configuration</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Property Type</Label>
                            <select className={selectClasses} value={formData.propertyType} onChange={(e) => { handleInputChange("propertyType", e.target.value); if (e.target.value !== "Residential") { handleInputChange("residentialSubType", ""); handleInputChange("bhk", ""); handleInputChange("furnishedStatus", ""); } }}>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Industrial">Industrial</option>
                                <option value="Agricultural">Agricultural</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">BHK / Rooms</Label>
                            <Input 
                                type="number" 
                                value={formData.bhk} 
                                onChange={(e) => handleInputChange("bhk", e.target.value)} 
                                disabled={formData.propertyType !== "Residential"}
                                className="bg-secondary/50 border-border/50 rounded-2xl py-[14px] focus:border-emerald-500/50 transition-all text-sm disabled:opacity-50" 
                                placeholder="e.g. 3" 
                            />
                          </div>
                      </div>

                      {/* Residential Sub-type & Furnished Status — only for Residential */}
                      {formData.propertyType === "Residential" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Residential Category</Label>
                            <select className={selectClasses} value={formData.residentialSubType} onChange={(e) => handleInputChange("residentialSubType", e.target.value)}>
                                <option value="">Select Category</option>
                                <option value="Flat">Flat / Apartment</option>
                                <option value="Villa">Villa</option>
                                <option value="House">Independent House</option>
                                <option value="Plot">Plot / Land</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Furnished Status</Label>
                            <select className={selectClasses} value={formData.furnishedStatus} onChange={(e) => handleInputChange("furnishedStatus", e.target.value)}>
                                <option value="">Select Status</option>
                                <option value="Furnished">Furnished</option>
                                <option value="Semi-Furnished">Semi-Furnished</option>
                                <option value="Unfurnished">Unfurnished</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Total Area *</Label>
                            <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden border border-border/50 focus-within:border-emerald-500/50 transition-all">
                                <Input 
                                    type="number" 
                                    value={formData.area} 
                                    onChange={(e) => handleInputChange("area", e.target.value)} 
                                    className="bg-secondary/50 border-none rounded-none py-6 flex-1 text-sm focus-visible:ring-0" 
                                    placeholder="1500" 
                                    required 
                                />
                                <select 
                                    className="bg-secondary/70 border-l border-border/50 px-4 text-xs font-bold text-emerald-400 outline-none appearance-none cursor-pointer hover:bg-secondary transition-colors" 
                                    value={formData.unit} 
                                    onChange={(e) => handleInputChange("unit", e.target.value)}
                                >
                                    <option value="sqft">SQ FT</option>
                                    <option value="sqyd">GAJ / SQ YD</option>
                                    <option value="bigha">BIGHA</option>
                                    <option value="kanal">KANAL</option>
                                    <option value="marla">MARLA</option>
                                    <option value="cent">CENT</option>
                                    <option value="acre">ACRE</option>
                                    <option value="hectare">HECTARE</option>
                                </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Status & Ownership</Label>
                            <div className="flex gap-2">
                                <select className={`${selectClasses} flex-1`} value={formData.propertyStatus} onChange={(e) => handleInputChange("propertyStatus", e.target.value)}>
                                    <option value="Under Construction">Under Const.</option>
                                    <option value="Ready to Move">Ready to Move</option>
                                    <option value="Old Property">Old Property</option>
                                </select>
                                <select className={`${selectClasses} flex-1`} value={formData.ownershipType} onChange={(e) => handleInputChange("ownershipType", e.target.value)}>
                                    <option value="Freehold">Freehold</option>
                                    <option value="Leasehold">Leasehold</option>
                                    <option value="Joint Ownership">Joint</option>
                                </select>
                            </div>
                          </div>
                      </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isRegistering || !isConnected}
                    className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 rounded-2xl py-8 text-lg font-black tracking-tight transition-all shadow-[0_0_50px_rgba(16,185,129,0.1)] hover:shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-3" /> Processing...
                      </>
                    ) : (
                      <>
                        Anchor to Blockchain <HardDrive className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
