import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { SuiWalletProvider } from "@/lib/sui-wallet-provider"
import { AppProvider } from "@/lib/context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DolpAds - The Web3 Ad Network Built on Sui",
  description: "The set-it-and-forget-it Web3 ad network. On-chain transparency. Off-chain speed. Built on Sui.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SuiWalletProvider>
            <AppProvider>{children}</AppProvider>
          </SuiWalletProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
