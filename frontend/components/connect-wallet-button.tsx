"use client"

import { useConnectWallet, useCurrentAccount, useDisconnectWallet, useWallets } from "@mysten/dapp-kit"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, LogOut, ChevronDown, Copy, Check, Loader2 } from "lucide-react"
import { useState } from "react"

interface ConnectWalletButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function ConnectWalletButton({ variant = "default", size = "default", className }: ConnectWalletButtonProps) {
  const account = useCurrentAccount()
  const wallets = useWallets()
  const { mutateAsync: connectWallet, isPending: isConnecting } = useConnectWallet()
  const { mutate: disconnect } = useDisconnectWallet()
  const [copied, setCopied] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCopyAddress = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleConnect = async (walletName: string) => {
    const wallet = wallets.find((w) => w.name === walletName)
    if (!wallet) return
    await connectWallet({ wallet })
    setDialogOpen(false)
  }

  // Not connected - show connect dialog
  if (!account) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant={variant} size={size} className={className} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect a Sui Wallet</DialogTitle>
            <DialogDescription>Choose a wallet to connect to DolpAds</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {wallets.map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="justify-start gap-3 h-14 px-4 bg-transparent"
                onClick={() => handleConnect(wallet.name)}
                disabled={isConnecting}
              >
                <img src={wallet.icon || "/placeholder.svg"} alt={wallet.name} className="h-8 w-8 rounded-lg" />
                <span className="font-medium">{wallet.name}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Don&apos;t have a wallet?{" "}
            <a
              href="https://sui.io/wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Get one here
            </a>
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  // Connected - show account dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className={className}>
          <Wallet className="mr-2 h-4 w-4 text-primary" />
          <span className="font-mono">{formatAddress(account.address)}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
          <p className="font-mono text-sm break-all">{account.address}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
          {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
