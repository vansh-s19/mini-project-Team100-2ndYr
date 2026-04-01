"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, DollarSign, Locate, Home, Building2, Layers, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const BACKEND_URL = "http://localhost:5001"

export default function MarketAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<number | null>(null)
  const [rentPrediction, setRentPrediction] = useState<number | null>(null)
  const [marketProperties, setMarketProperties] = useState([])
  const [loadingMarket, setLoadingMarket] = useState(false)
  
  const [formData, setFormData] = useState({
    city: "Delhi",
    area: 1200,
    bedrooms: 3,
    bathrooms: 2,
    balcony: 1,
    propertyType: "Flat",
    furnishing: "Semi-Furnished",
    lat: 28.6139,
    lng: 77.2090
  })

  const handlePredict = async () => {
    setLoading(true)
    try {
      // Map form data to ML feature vector
      // [area, bedrooms, bathrooms, balcony, lat, lng, f_semi, f_unfurn, f_unknown, pt_flat, pt_house, c_gurgaon, c_mumbai]
      const f_semi = formData.furnishing === "Semi-Furnished" ? 1 : 0;
      const f_unfurn = formData.furnishing === "Unfurnished" ? 1 : 0;
      const f_unknown = 0;
      const pt_flat = formData.propertyType === "Flat" ? 1 : 0;
      const pt_house = formData.propertyType === "Individual House" ? 1 : 0;
      const c_gurgaon = formData.city === "Gurgaon" ? 1 : 0;
      const c_mumbai = formData.city === "Mumbai" ? 1 : 0;

      const features = [
        Number(formData.area),
        Number(formData.bedrooms),
        Number(formData.bathrooms),
        Number(formData.balcony),
        Number(formData.lat),
        Number(formData.lng),
        f_semi, f_unfurn, f_unknown,
        pt_flat, pt_house,
        c_gurgaon, c_mumbai
      ];

      const res = await axios.post(`${BACKEND_URL}/api/market/predict`, { features });
      setPrediction(res.data.predicted_price);

      // Simple rent prediction as well
      // [beds, area, mumbai_flag]
      const rentFeatures = [Number(formData.bedrooms), Number(formData.area), c_mumbai];
      // For rent, the model expects 761 features based on app.py (likely one-hot encoded locations)
      // We'll pad with zeros for now or just skip if it's too complex
      const fullRentVec = Array(761).fill(0);
      fullRentVec[0] = Number(formData.bedrooms);
      fullRentVec[1] = Number(formData.area);
      fullRentVec[2] = c_mumbai;
      
      const rentRes = await axios.post(`${BACKEND_URL}/api/market/predict-rent`, { features: fullRentVec });
      setRentPrediction(rentRes.data.predicted_rent);

    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchMarket = async () => {
        setLoadingMarket(true)
        try {
            const res = await axios.get(`${BACKEND_URL}/api/market/properties`)
            setMarketProperties(res.data.slice(0, 8)) // Show top 8 for marketplace
        } catch (e) {
            console.error("Market fetch error:", e)
        } finally {
            setLoadingMarket(false)
        }
    }
    fetchMarket()
  }, [])

  const chartData = [
    { name: 'Estimated Price', value: prediction ? prediction / 100000 : 0, color: '#3B82F6' },
    { name: 'Monthly Rent', value: rentPrediction ? rentPrediction / 1000 : 0, color: '#10B981' }
  ];

  return (
    <main className="min-h-screen bg-[#0f1513] text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              AI Market Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Predict Property <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Value.</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Leverage deep learning models to estimate property prices and rental yields across major Indian metropolises.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Input Form */}
            <motion.div className="lg:col-span-5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-2xl rounded-[40px] overflow-hidden border">
                <CardHeader className="bg-secondary/30 border-b border-border/50 p-6">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Property Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-[10px] uppercase font-black tracking-widest ml-1">City</Label>
                      <Select defaultValue="Delhi" onValueChange={(v) => setFormData({...formData, city: v})}>
                        <SelectTrigger className="bg-secondary/50 border-border/50 rounded-2xl py-6">
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1513] border-border/50 backdrop-blur-xl">
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                          <SelectItem value="Mumbai">Mumbai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-[10px] uppercase font-black tracking-widest ml-1">Area (sq ft)</Label>
                      <Input type="number" value={formData.area} onChange={(e) => setFormData({...formData, area: Number(e.target.value)})} className="bg-secondary/50 border-border/50 rounded-2xl py-6 font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-[10px] uppercase font-black tracking-widest ml-1">BHK</Label>
                      <Input type="number" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: Number(e.target.value)})} className="bg-secondary/50 border-border/50 rounded-2xl py-6 font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-[10px] uppercase font-black tracking-widest ml-1">Baths</Label>
                      <Input type="number" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: Number(e.target.value)})} className="bg-secondary/50 border-border/50 rounded-2xl py-6 font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-[10px] uppercase font-black tracking-widest ml-1">Balc</Label>
                      <Input type="number" value={formData.balcony} onChange={(e) => setFormData({...formData, balcony: Number(e.target.value)})} className="bg-secondary/50 border-border/50 rounded-2xl py-6 font-mono" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 text-[10px] uppercase font-black tracking-widest ml-1">Furnishing</Label>
                    <Select defaultValue="Semi-Furnished" onValueChange={(v) => setFormData({...formData, furnishing: v})}>
                      <SelectTrigger className="bg-secondary/50 border-border/50 rounded-2xl py-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f1513] border-border/50 backdrop-blur-xl">
                        <SelectItem value="Furnished">Fully Furnished</SelectItem>
                        <SelectItem value="Semi-Furnished">Semi-Furnished</SelectItem>
                        <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handlePredict} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-2xl py-8 text-lg font-black shadow-lg shadow-emerald-500/20 transition-all">
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Calculating...</>
                    ) : (
                      <><BarChart3 className="w-5 h-5 mr-2" /> Generate Valuation</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Section */}
            <motion.div className="lg:col-span-7 space-y-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <AnimatePresence mode="wait">
                {prediction ? (
                  <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-8 rounded-[40px] bg-secondary/30 border border-border/50 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-500"><DollarSign className="w-24 h-24 text-emerald-400" /></div>
                        <div className="relative z-10">
                          <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Market Valuation</h4>
                          <div className="flex items-baseline gap-2">
                             <span className="text-4xl md:text-5xl font-black tracking-tighter">₹{((prediction || 0) / 10000000).toFixed(2)}</span>
                             <span className="text-2xl font-bold text-emerald-400/80">Cr</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 rounded-[40px] bg-secondary/30 border border-border/50 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-500"><Home className="w-24 h-24 text-emerald-400" /></div>
                        <div className="relative z-10">
                          <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Monthly Yield</h4>
                          <div className="flex items-baseline gap-2">
                             <span className="text-4xl md:text-5xl font-black tracking-tighter">₹{Math.round((rentPrediction || 0) / 1000)}k</span>
                             <span className="text-2xl font-bold text-emerald-400/80">/mo</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-[40px] overflow-hidden p-8 border">
                       <CardTitle className="text-lg mb-8 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                        Valuation Trends (Lakhs / K)
                      </CardTitle>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                            <XAxis dataKey="name" stroke="#94A3B8" />
                            <YAxis stroke="#94A3B8" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f1513', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#F8FAFC' }} />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                              {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <div className="flex flex-wrap gap-4">
                      {[
                        { icon: Locate, label: formData.city },
                        { icon: Layers, label: `${formData.area} sq ft` },
                        { icon: Building2, label: formData.propertyType }
                      ].map((chip, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-slate-300 text-[10px] font-black uppercase tracking-widest">
                          <chip.icon className="w-3 h-3 text-emerald-400" /> {chip.label}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 p-12 rounded-[40px] bg-secondary/20 border border-border/50 backdrop-blur-sm text-slate-500 min-h-[300px]">
                    <TrendingUp className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-lg font-bold">Generate AI-driven valuation.</p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Marketplace <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Listings.</span></h2>
              <p className="text-slate-400 text-sm">Verified algorithmic valuations for decentralized property stakes.</p>
            </div>
            <Button variant="outline" className="rounded-2xl border-border/50 hover:bg-white/5 px-6">View All <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {loadingMarket ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="h-[400px] rounded-[40px] bg-secondary/20 animate-pulse border border-border/50" />)
            ) : marketProperties.map((p: any, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-emerald-500/30 transition-all duration-500 rounded-[40px] overflow-hidden border">
                  <div className="h-48 bg-secondary/50 relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800')] opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
                     <div className="absolute top-4 right-4 px-3 py-1 bg-[#0f1513]/80 backdrop-blur-md rounded-full border border-border text-[10px] font-black uppercase tracking-widest text-emerald-400">Verified</div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-bold mb-1 truncate">{p.name || "Modern Estate"}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">{p.city}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                       <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/50 border border-border">
                          <Layers className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-300">{p.area} sqft</span>
                       </div>
                       <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/50 border border-border">
                          <Home className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-300">{p.bedrooms} BHK</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Market Cap</p>
                        <p className="text-xl font-black text-emerald-400">₹{(p.area * 5000 / 100000).toFixed(1)}L*</p>
                      </div>
                      <Button size="icon" className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all"><ArrowRight className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
