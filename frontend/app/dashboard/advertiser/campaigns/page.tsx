"use client"

import { useQuery } from "@tanstack/react-query"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchCampaigns, mistToSui } from "@/lib/api"
import { Pause, Pencil, Play, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"

const network = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet").toLowerCase()
const suiScanBase =
  network === "mainnet"
    ? "https://suiscan.xyz/mainnet/object"
    : network === "devnet"
      ? "https://suiscan.xyz/devnet/object"
      : "https://suiscan.xyz/testnet/object"

export default function CampaignsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  })

  const campaigns = data?.campaigns ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage all your advertising campaigns</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/advertiser/create">Create Campaign</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>View and manage your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {isError && <p className="text-sm text-destructive mb-4">Failed to load campaigns.</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Bid (CPC)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const spent = mistToSui(campaign.spentAmount)
                const budget = mistToSui(campaign.totalDeposited)
                const cpc = mistToSui(campaign.cpcBid)
                const displayName = campaign.name || campaign.id
                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{displayName}</span>
                          {campaign.targetUrl && (
                            <a
                              href={campaign.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{campaign.id}</span>
                          <a
                            href={`${suiScanBase}/${campaign.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={campaign.status as any} />
                    </TableCell>
                    <TableCell>{budget.toLocaleString(undefined, { maximumFractionDigits: 3 })} SUI</TableCell>
                    <TableCell>{spent.toLocaleString(undefined, { maximumFractionDigits: 3 })} SUI</TableCell>
                    <TableCell>{cpc.toFixed(4)} SUI</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {campaign.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {!isLoading && campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No campaigns yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
