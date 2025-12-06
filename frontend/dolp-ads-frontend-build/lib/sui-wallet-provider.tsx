"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// Types for wallet state
interface WalletAccount {
  address: string
  publicKey: Uint8Array | null
}

interface WalletInfo {
  name: string
  icon: string
}

interface SuiWalletContextType {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  currentAccount: WalletAccount | null
  // Available wallets (mock for now)
  wallets: WalletInfo[]
  // Actions
  connect: (walletName?: string) => Promise<void>
  disconnect: () => void
}

const SuiWalletContext = createContext<SuiWalletContextType | undefined>(undefined)

// Mock wallets that would be detected
const MOCK_WALLETS: WalletInfo[] = [
  { name: "Sui Wallet", icon: "https://sui.io/favicon.ico" },
  { name: "Suiet", icon: "https://suiet.app/favicon.ico" },
  { name: "Ethos Wallet", icon: "https://ethoswallet.xyz/favicon.ico" },
]

export function SuiWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<WalletAccount | null>(null)

  const connect = useCallback(async (walletName?: string) => {
    setIsConnecting(true)

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate a mock Sui address (0x prefix + 64 hex chars)
    const mockAddress = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    setCurrentAccount({
      address: mockAddress,
      publicKey: null,
    })
    setIsConnected(true)
    setIsConnecting(false)
  }, [])

  const disconnect = useCallback(() => {
    setCurrentAccount(null)
    setIsConnected(false)
  }, [])

  return (
    <SuiWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        currentAccount,
        wallets: MOCK_WALLETS,
        connect,
        disconnect,
      }}
    >
      {children}
    </SuiWalletContext.Provider>
  )
}

export function useSuiWallet() {
  const context = useContext(SuiWalletContext)
  if (context === undefined) {
    throw new Error("useSuiWallet must be used within a SuiWalletProvider")
  }
  return context
}
