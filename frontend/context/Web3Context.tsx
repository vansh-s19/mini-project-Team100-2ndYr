"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { ethers } from "ethers"

import ContractABI from "@/lib/LandRegistry.json"
import ContractAddress from "@/lib/contract-address.json"

interface Web3ContextType {
  account: string | null
  provider: ethers.providers.Web3Provider | null
  signer: ethers.Signer | null
  contract: ethers.Contract | null
  chainId: number | null
  isConnecting: boolean
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const Web3Context = createContext<Web3ContextType | null>(null)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("MetaMask not detected! Please install MetaMask.")
      return
    }

    setIsConnecting(true)
    try {
      const prov = new ethers.providers.Web3Provider((window as any).ethereum)
      const accounts = await prov.send("eth_requestAccounts", [])
      const sign = prov.getSigner()
      const network = await prov.getNetwork()
      
      // Target Hardhat Localhost (ChainID: 31337)
      const TARGET_CHAIN_ID = 31337
      if (network.chainId !== TARGET_CHAIN_ID && network.chainId !== 1337) {
        console.warn(`⚠️ Network Mismatch! Expected: ${TARGET_CHAIN_ID}, Got: ${network.chainId}`);
        alert(`Warning: You are connected to ChainID ${network.chainId}. The Land Registry contract is typically deployed on Localhost (31337). Transactions may fail.`);
      }

      const landRegistry = new ethers.Contract(
        ContractAddress.LandRegistry,
        ContractABI.abi,
        sign
      )

      setProvider(prov)
      setSigner(sign)
      setAccount(accounts[0])
      setChainId(network.chainId)
      setContract(landRegistry)
      console.log(`✅ Connected: ${accounts[0]} on Chain ${network.chainId}`);
    } catch (error) {
      console.error("Wallet connection error:", error)
      alert("Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setContract(null)
    setChainId(null)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== account) {
        setAccount(accounts[0])
        if (provider) {
          const sign = provider.getSigner()
          setSigner(sign)
          const landRegistry = new ethers.Contract(
            ContractAddress.LandRegistry,
            ContractABI.abi,
            sign
          )
          setContract(landRegistry)
        }
      }
    }

    const handleChainChanged = () => {
      window.location.reload()
    }

    ;(window as any).ethereum.on("accountsChanged", handleAccountsChanged)
    ;(window as any).ethereum.on("chainChanged", handleChainChanged)

    return () => {
      ;(window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged)
      ;(window as any).ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [account, provider, disconnectWallet])

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    contract,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

export default Web3Context
