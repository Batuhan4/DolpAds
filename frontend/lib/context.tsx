"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSuiWallet } from "@/lib/sui-wallet-provider"

export type UserRole = "advertiser" | "publisher"

interface WalletState {
  address: string | null
  balance: number
  isConnected: boolean
}

interface AppContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  wallet: WalletState
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("advertiser")
  const { isConnected, currentAccount } = useSuiWallet()

  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: 0,
    isConnected: false,
  })

  useEffect(() => {
    if (isConnected && currentAccount) {
      setWallet({
        address: `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`,
        balance: 12450.5, // Mock balance for display purposes
        isConnected: true,
      })
    } else {
      setWallet({
        address: null,
        balance: 0,
        isConnected: false,
      })
    }
  }, [isConnected, currentAccount])

  return <AppContext.Provider value={{ role, setRole, wallet }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
