"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Wallet } from "lucide-react"
import ElectricBorder from "@/components/ElectricBorder"
import BorderGlow from "@/components/BorderGlow"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/properties", label: "My Properties" },
  { href: "/transfer", label: "Transfer" },
  { href: "/verify", label: "Verify" },
  { href: "/authority", label: "Authority" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const connectWallet = () => {
    setIsConnected(true)
    setWalletAddress("0x1234...5678")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <nav className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/80 px-6 py-3 backdrop-blur-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <span className="text-sm font-bold text-background">LC</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">LandChain</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <BorderGlow
                key={link.href}
                edgeSensitivity={20}
                glowColor="40 80 80"
                backgroundColor="transparent"
                borderRadius={8}
                glowRadius={20}
                glowIntensity={1}
                coneSpread={25}
                animated={false}
                colors={['#c084fc', '#f472b6', '#38bdf8']}
              >
                <Link
                  href={link.href}
                  className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground block w-full text-center"
                >
                  {link.label}
                </Link>
              </BorderGlow>
            ))}
          </div>

          {/* Wallet Connect */}
          <div className="hidden items-center gap-3 lg:flex">
            {isConnected ? (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">{walletAddress}</span>
              </div>
            ) : (
              <ElectricBorder
                color="#7df9ff"
                speed={1}
                chaos={0.12}
                className=""
                style={{ borderRadius: 12 }}
              >
                <Button onClick={connectWallet} className="gap-2 rounded-xl">
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              </ElectricBorder>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-border bg-background/95 backdrop-blur-xl">
              <div className="flex flex-col gap-6 pt-8">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <BorderGlow
                      key={link.href}
                      edgeSensitivity={20}
                      glowColor="40 80 80"
                      backgroundColor="transparent"
                      borderRadius={12}
                      glowRadius={20}
                      glowIntensity={1}
                      coneSpread={25}
                      animated={false}
                      colors={['#c084fc', '#f472b6', '#38bdf8']}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl px-4 py-3 text-lg transition-colors hover:bg-white/10 block w-full"
                      >
                        {link.label}
                      </Link>
                    </BorderGlow>
                  ))}
                </div>
                <div className="border-t border-border pt-6">
                  {isConnected ? (
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">{walletAddress}</span>
                    </div>
                  ) : (
                    <ElectricBorder
                      color="#7df9ff"
                      speed={1}
                      chaos={0.12}
                      className=""
                      style={{ borderRadius: 12 }}
                    >
                      <Button onClick={connectWallet} className="w-full gap-2 rounded-xl">
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                      </Button>
                    </ElectricBorder>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  )
}
