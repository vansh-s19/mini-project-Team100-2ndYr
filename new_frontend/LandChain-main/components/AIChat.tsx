"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Volume2, VolumeX, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const BACKEND_URL = "http://localhost:5001"

interface Message {
  role: "user" | "ai"
  content: string
  timestamp: Date
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
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
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const speak = (text: string) => {
    if (isMuted) return
    // Cancel any current speech
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
    recognition.onerror = () => setIsListening(false)
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      // Auto-send after a small delay to let the user see the text
      setTimeout(() => {
        handleSendFromVoice(transcript)
      }, 500)
    }

    recognition.start()
  }

  // Specialized send for voice to handle the updated transcript correctly
  const handleSendFromVoice = async (voiceText: string) => {
    if (!voiceText.trim()) return

    const userMessage: Message = {
      role: "user",
      content: voiceText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
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
          message: input, 
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
    <div className="fixed z-50 flex flex-col items-end" style={{ bottom: "0px", right: "0px" }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mr-2"
          >
            <Card className="w-[380px] h-[500px] flex flex-col shadow-2xl border-primary/20 bg-background/80 backdrop-blur-xl overflow-hidden mb-2">
              {/* Header */}
              <div className="p-4 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">LandChain AI</h3>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      const newMute = !isMuted;
                      setIsMuted(newMute);
                      if (newMute) window.speechSynthesis.cancel();
                    }} 
                    className="hover:bg-primary/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-primary/20">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted border border-border rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted border border-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground italic">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 bg-muted/30 border-t border-border">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      placeholder={isListening ? "Listening..." : "Type a message..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      className={`bg-background/50 border-primary/20 ${isListening ? "border-primary animate-pulse" : ""}`}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={toggleListening}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full w-8 h-8 p-0 ${isListening ? "text-primary animate-bounce" : "text-muted-foreground"}`}
                    >
                      {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button size="icon" onClick={handleSend} disabled={isLoading || isListening}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-colors border-2 border-background"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
      </motion.button>
    </div>
  )
}
