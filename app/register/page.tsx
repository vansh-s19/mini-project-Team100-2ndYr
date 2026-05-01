"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, ScanText, HardDrive, Loader2, CheckCircle } from "lucide-react"

interface ExtractedData {
  ownerName: string
  plotNumber: string
  registryId: string
  address: string
  area: string
  date: string
}

export default function RegisterPropertyPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExtracted, setIsExtracted] = useState(false)
  const [formData, setFormData] = useState<ExtractedData>({
    ownerName: "",
    plotNumber: "",
    registryId: "",
    address: "",
    area: "",
    date: ""
  })

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      simulateOCR()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      simulateOCR()
    }
  }

  const simulateOCR = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setFormData({
        ownerName: "John Anderson",
        plotNumber: "PLT-2024-00847",
        registryId: "REG-NYC-847291",
        address: "245 Park Avenue, Manhattan, NY 10167",
        area: "2,500 sq ft",
        date: "2024-03-15"
      })
      setIsProcessing(false)
      setIsExtracted(true)
    }, 2000)
  }

  const handleInputChange = (field: keyof ExtractedData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <main className="min-h-screen bg-[#0f1513]">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-4">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Register Property
            </h1>
            <p className="text-muted-foreground">
              Upload your property documents and we&apos;ll extract the details automatically using AI-powered OCR.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upload Section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Document
                </CardTitle>
                <CardDescription>
                  Drag and drop or click to upload your property deed (PDF or Image)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 transition-colors hover:border-muted-foreground/50 hover:bg-secondary/50"
                >
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Processing Document...</p>
                        <p className="text-sm text-muted-foreground">Extracting property details with OCR</p>
                      </div>
                    </div>
                  ) : file ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                        <Upload className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Drop files here or click to upload</p>
                        <p className="text-sm text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Process Steps */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className={`flex flex-col items-center rounded-lg p-3 text-center ${file ? "bg-secondary" : "bg-secondary/30"}`}>
                    <ScanText className="mb-2 h-5 w-5" />
                    <span className="text-xs">OCR Extract</span>
                  </div>
                  <div className={`flex flex-col items-center rounded-lg p-3 text-center ${isExtracted ? "bg-secondary" : "bg-secondary/30"}`}>
                    <CheckCircle className="mb-2 h-5 w-5" />
                    <span className="text-xs">Verify Data</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-secondary/30 p-3 text-center">
                    <HardDrive className="mb-2 h-5 w-5" />
                    <span className="text-xs">Store on IPFS</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Property Details
                </CardTitle>
                <CardDescription>
                  {isExtracted 
                    ? "Review and edit the extracted information below"
                    : "Details will be auto-filled after OCR processing"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange("ownerName", e.target.value)}
                      placeholder="Enter owner name"
                      className="rounded-lg bg-secondary/50"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="plotNumber">Plot Number</Label>
                      <Input
                        id="plotNumber"
                        value={formData.plotNumber}
                        onChange={(e) => handleInputChange("plotNumber", e.target.value)}
                        placeholder="PLT-XXXX-XXXXX"
                        className="rounded-lg bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registryId">Registry ID</Label>
                      <Input
                        id="registryId"
                        value={formData.registryId}
                        onChange={(e) => handleInputChange("registryId", e.target.value)}
                        placeholder="REG-XXX-XXXXXX"
                        className="rounded-lg bg-secondary/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Property Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter full address"
                      className="rounded-lg bg-secondary/50"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area</Label>
                      <Input
                        id="area"
                        value={formData.area}
                        onChange={(e) => handleInputChange("area", e.target.value)}
                        placeholder="e.g., 2,500 sq ft"
                        className="rounded-lg bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Registration Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className="rounded-lg bg-secondary/50"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gap-2 rounded-xl"
                    disabled={!isExtracted}
                  >
                    <HardDrive className="h-4 w-4" />
                    Upload to IPFS & Register
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
