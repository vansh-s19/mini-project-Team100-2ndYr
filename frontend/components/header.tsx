"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Wallet, LogOut, User as UserIcon } from "lucide-react"
import ElectricBorder from "@/components/ElectricBorder"
import BorderGlow from "@/components/BorderGlow"
import { useWeb3 } from "@/context/Web3Context"
import { useAuth } from "@/context/AuthContext"

const navLinks = [
  { href: "/properties", label: "My Properties" },
  { href: "/market", label: "Market" },
  { href: "/maps", label: "Maps" },
  { href: "/transfer", label: "Transfer" },
  { href: "/verify", label: "Verify" },
  { href: "/profile", label: "Profile" },
]

export function Header() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWeb3()
  const { user, isAuthenticated, logout } = useAuth()

  const truncatedAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : ""

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
          <div className="hidden items-center gap-1.5 lg:flex">
            {navLinks
              .filter(link => {
                if (user?.role === "authority") {
                  return !["/properties", "/market", "/transfer"].includes(link.href)
                }
                return true
              })
              .map((link) => (
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
                colors={['#10b981', '#14b8a6', '#4ade80']}
              >
                <Link
                  href={link.href}
                  className="rounded-lg px-5 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground block w-full text-center whitespace-nowrap min-w-[80px]"
                >
                  {link.label}
                </Link>
              </BorderGlow>
            ))}
            {user?.role === "authority" && (
              <BorderGlow
                edgeSensitivity={20}
                glowColor="40 80 80"
                backgroundColor="transparent"
                borderRadius={8}
                glowRadius={20}
                glowIntensity={1}
                coneSpread={25}
                animated={false}
                colors={['#10b981', '#14b8a6', '#4ade80']}
              >
                <Link
                  href="/authority"
                  className="rounded-lg px-4 py-2 text-sm font-bold text-emerald-400 transition-colors hover:bg-white/10 block w-full text-center"
                >
                  Authority
                </Link>
              </BorderGlow>
            )}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 mr-2">
                <Link href="/profile">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-emerald-500/10 px-4 py-2 hover:bg-emerald-500/20 transition-colors">
                    <UserIcon className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">{user?.name}</span>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} className="rounded-lg h-9 w-9">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" className="rounded-xl font-bold">Log In</Button>
              </Link>
            )}

            <div className="w-[1px] h-6 bg-border mx-1" />
            
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium font-mono">{truncatedAddress}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={disconnectWallet} className="rounded-lg h-9 w-9">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <ElectricBorder
                color="#10b981"
                speed={1}
                chaos={0.12}
                className=""
                style={{ borderRadius: 12 }}
              >
                <Button onClick={connectWallet} disabled={isConnecting} className="gap-2 rounded-xl">
                  <Wallet className="h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
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
                  {navLinks
                    .filter(link => {
                      if (user?.role === "authority") {
                        return !["/properties", "/market", "/transfer"].includes(link.href)
                      }
                      return true
                    })
                    .map((link) => (
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
                      colors={['#10b981', '#14b8a6', '#4ade80']}
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
                  {user?.role === "authority" && (
                    <BorderGlow
                      edgeSensitivity={20}
                      glowColor="40 80 80"
                      backgroundColor="transparent"
                      borderRadius={12}
                      glowRadius={20}
                      glowIntensity={1}
                      coneSpread={25}
                      animated={false}
                      colors={['#10b981', '#14b8a6', '#4ade80']}
                    >
                      <Link
                        href="/authority"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl px-4 py-3 text-lg font-bold text-emerald-400 transition-colors hover:bg-white/10 block w-full"
                      >
                        Authority Dashboard
                      </Link>
                    </BorderGlow>
                  )}
                </div>
                <div className="border-t border-border pt-6">
                  {isConnected ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium font-mono">{truncatedAddress}</span>
                      </div>
                      <Button variant="outline" onClick={disconnectWallet} className="w-full gap-2 rounded-xl">
                        <LogOut className="h-4 w-4" />
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <ElectricBorder
                      color="#10b981"
                      speed={1}
                      chaos={0.12}
                      className=""
                      style={{ borderRadius: 12 }}
                    >
                      <Button onClick={connectWallet} disabled={isConnecting} className="w-full gap-2 rounded-xl">
                        <Wallet className="h-4 w-4" />
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
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
