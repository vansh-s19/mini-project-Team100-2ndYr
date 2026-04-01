"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Volume2, VolumeX, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/context/Web3Context"

const BACKEND_URL = "http://localhost:5001"

interface Message {
  role: "user" | "ai"
  content: string
  timestamp: Date
}

export function AIChat() {
  const { account, isConnected } = useWeb3()
  console.log("AIChat Web3 Status:", { isConnected, account })
  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I'm your LandChain Assistant. How can I help you with property registration today?",
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const speak = (text: string) => {
    if (isMuted) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.1
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error)
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please enable it in your browser settings to use voice features.")
      }
      setIsListening(false)
    }
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setTimeout(() => {
        handleSendFromVoice(transcript)
      }, 500)
    }

    recognition.start()
  }

  const handleSendFromVoice = async (voiceText: string) => {
    if (!voiceText.trim()) return

    const userMessage: Message = {
      role: "user",
      content: voiceText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: voiceText, 
          history: messages.map(m => ({ 
            role: m.role === "ai" ? "assistant" : "user", 
            content: m.content 
          })) 
        }),
      })
      const data = await response.json()
      const aiMessage: Message = { role: "ai", content: data.response, timestamp: new Date() }
      setMessages(prev => [...prev, aiMessage])
      speak(data.response)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const renderMessageContent = (content: string) => {
    // Simple bold formatter
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-emerald-400">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: `${input} (Please respond concisely with key points formatted as bold text)`, 
          history: messages.map(m => ({ 
            role: m.role === "ai" ? "assistant" : "user", 
            content: m.content 
          })) 
        }),
      })

      const data = await response.json()
      const aiMessage: Message = {
        role: "ai",
        content: data.response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      speak(data.response)
    } catch (error) {
      console.error("Chat Error:", error)
      setMessages(prev => [...prev, {
        role: "ai",
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed z-[60] flex flex-col items-end shadow-2xl" style={{ bottom: "20px", right: "20px" }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="mb-6"
          >
            <Card className="w-[380px] h-[600px] flex flex-col shadow-[0_0_80px_rgba(16,185,129,0.1)] border-border/50 bg-[#0f1513]/95 backdrop-blur-3xl overflow-hidden rounded-[40px] border">
              
              {/* Header Container */}
              <div className="shrink-0 z-30 p-6 bg-secondary/30 border-b border-border/50 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30" />
                
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center border border-border">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="text-md font-black text-white tracking-tight">LandChain <span className="text-emerald-400 text-xs">AI</span></h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="rounded-xl border border-border/50 hover:bg-secondary/50 w-8 h-8"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-xl border border-border/50 hover:bg-secondary/50 w-8 h-8">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

               {/* Messages Area */}
              <ScrollArea className="flex-1 h-[calc(600px-160px)]">
                <div className="p-6 space-y-4">
                  {messages.map((msg, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[90%] p-3.5 px-4 rounded-[22px] text-[13px] leading-snug shadow-sm ${
                        msg.role === "user" 
                          ? "bg-emerald-600 text-white rounded-tr-none font-bold" 
                          : "bg-secondary/40 border border-border/50 text-slate-200 rounded-tl-none backdrop-blur-md"
                      }`}>
                        {renderMessageContent(msg.content)}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-secondary/40 border border-border/50 p-3.5 px-4 rounded-[22px] rounded-tl-none flex items-center gap-3">
                        <div className="flex gap-1">
                          {[1,2,3].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                              className="w-1 h-1 bg-emerald-500 rounded-full"
                            />
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Neural Link Open...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Enhanced Input Area */}
              <div className="p-6 bg-secondary/20 border-t border-border/50">
                <div className="flex gap-2.5">
                  <div className="relative flex-1 group">
                    <Input 
                      placeholder={isListening ? "Listening..." : "Ask Assistant..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      className={`bg-secondary/50 border-border/50 h-12 rounded-xl pl-10 pr-4 text-sm focus:border-emerald-500/50 transition-all ${isListening ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : ""}`}
                    />
                    <Bot className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={toggleListening}
                      size="icon"
                      className={`w-12 h-12 rounded-xl transition-all border border-border/50 ${isListening ? "bg-red-600 hover:bg-red-500" : "bg-secondary/50 hover:bg-secondary/80"}`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                    </Button>
                    <Button 
                      onClick={handleSend} 
                      size="icon"
                      disabled={isLoading || isListening || !input.trim()}
                      className="w-12 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
      >
        <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
        <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-2xl flex items-center justify-center relative overflow-hidden border border-white/20">
          <motion.div animate={{ rotate: isOpen ? 90 : 0, scale: isOpen ? 0.8 : 1 }} className="z-10">
             {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-10 h-10 fill-current" />}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
        </div>
      </motion.button>
    </div>
  )
}
