"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useMemo } from "react"
import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"

const { networkConfig } = createNetworkConfig({
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
})

const queryClient = new QueryClient()

export function SuiWalletProvider({ children }: { children: ReactNode }) {
  // Allow switching via env, default to testnet
  const defaultNetwork = useMemo(
    () => (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet" | undefined) ?? "testnet",
    [],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={defaultNetwork}>
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
