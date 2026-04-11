"use client"

import { useState } from "react"
import axios from "axios"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, HardDrive, Loader2, ShieldCheck, Sparkles } from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"
import { motion } from "framer-motion"

const BACKEND_URL = "http://localhost:5001"

interface ExtractedData {
  ownerNames: string
  plotNumber: string
  registryId: string
  address: string
  area: string
}

export default function RegisterPropertyPage() {
  const { contract, isConnected } = useWeb3()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [ipfsHash, setIpfsHash] = useState("")
  const [formData, setFormData] = useState<ExtractedData>({
    ownerNames: "",
    plotNumber: "",
    registryId: "",
    address: "",
    area: ""
  })

  // ───────────────────────── Logic ─────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    setFile(selectedFile)
    setIsProcessing(true)

    try {
      const formPayload = new FormData()
      formPayload.append("document", selectedFile)

      const response = await axios.post(`${BACKEND_URL}/api/ocr/extract`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (response.data.success) {
        const fields = response.data.fields
        setFormData({
          ownerNames: fields.ownerName || "",
          plotNumber: fields.plotNumber || "",
          registryId: fields.registryId || "",
          address: fields.address || "",
          area: fields.area || ""
        })
      }
    } catch (error) {
      console.error("OCR Error:", error)
      // We don't alert here to keep the "fill manually" fallback seamless
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInputChange = (field: keyof ExtractedData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || !isConnected) {
      alert("Please connect your wallet first!")
      return
    }
    if (!file) {
      alert("Please upload the property deed document.")
      return
    }

    setIsRegistering(true)
    console.log("🚀 Starting Registration Flow...")
    try {
      // Step 1: Upload to IPFS
      console.log("  → Step 1: Uploading Deed to IPFS via Backend...");
      const ipfsPayload = new FormData()
      ipfsPayload.append("document", file)
      
      const ipfsResponse = await axios.post(`${BACKEND_URL}/api/ipfs/upload`, ipfsPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      
      const cid = ipfsResponse.data.cid
      console.log(`  ✅ IPFS Success! CID: ${cid}`);
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
              <p className="text-slate-400 mb-8 leading-relaxed">The property deed has been successfully hashed and anchored to the Ethereum Ledger.</p>
              
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50 mb-8 space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  <span>Deed CID</span>
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

  // ───────────────────────── Main Render ─────────────────────────

  return (
    <main className="min-h-screen bg-[#0f1513] text-white">
      <Header />
      
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Initiate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Property Registry.</span></h1>
            <p className="text-slate-400 max-w-xl mx-auto leading-relaxed text-lg">Secure your property deed on-chain. Upload your document for automatic extraction or fill the details manually.</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Upload */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[40px] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
                <div className={`relative p-8 rounded-[40px] bg-card/50 border-2 border-dashed ${file ? "border-emerald-500/40" : "border-border/50"} backdrop-blur-sm transition-all flex flex-col items-center justify-center min-h-[350px]`}>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  
                  {isProcessing ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                      <h3 className="font-bold text-emerald-400">Scanning Deed...</h3>
                    </div>
                  ) : file ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
                        <FileText className="w-8 h-8 text-emerald-400" />
                      </div>
                      <p className="font-bold text-sm text-emerald-400 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Document Loaded</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border group-hover:border-emerald-500/30 transition-all shadow-inner">
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition-all" />
                      </div>
                      <h3 className="font-bold mb-1">Upload Deed</h3>
                      <p className="text-xs text-slate-500">PDF, PNG or JPG (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-secondary/30 border border-border/50 flex gap-4 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Our system uses OCR to auto-fill the form. Please verify the extracted data before securing the registry.
                </p>
              </div>
            </div>

            {/* Right Column: Form Fields */}
            <div className="lg:col-span-7">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm rounded-[40px] p-8 border">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Registry ID</Label>
                      <Input value={formData.registryId} onChange={(e) => handleInputChange("registryId", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-6 focus:border-emerald-500/50 transition-all font-mono" placeholder="e.g. DEED-8829" required />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Plot Number</Label>
                        <Input value={formData.plotNumber} onChange={(e) => handleInputChange("plotNumber", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-6 focus:border-emerald-500/50 transition-all font-mono" placeholder="e.g. 402/B" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Full Name of Owner(s)</Label>
                    <Input value={formData.ownerNames} onChange={(e) => handleInputChange("ownerNames", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-6 focus:border-emerald-500/50 transition-all" placeholder="John Doe" required />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Property Address</Label>
                    <Input value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-6 focus:border-emerald-500/50 transition-all font-mono" placeholder="123 Emerald Street, Green City" required />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Total Area</Label>
                    <Input value={formData.area} onChange={(e) => handleInputChange("area", e.target.value)} className="bg-secondary/50 border-border/50 rounded-2xl py-6 focus:border-emerald-500/50 transition-all font-mono" placeholder="e.g. 1500 sq ft" required />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isRegistering || !isConnected}
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl py-8 text-lg font-black tracking-tight transition-all shadow-[0_0_50px_rgba(16,185,129,0.1)] hover:shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-3" /> Securing Registry...
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
