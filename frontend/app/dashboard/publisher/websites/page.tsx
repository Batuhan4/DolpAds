"use client"

import { useEffect, useMemo, useState } from "react"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createWebsite, fetchWebsites, type Website } from "@/lib/api"
import { Plus, ExternalLink, Check } from "lucide-react"

export default function WebsitesPage() {
  const publisherWallet = useMemo(
    () => process.env.NEXT_PUBLIC_PUBLISHER_WALLET ?? "0x0000000000000000000000000000000000000000000000000000000000000001",
    [],
  )
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newWebsite, setNewWebsite] = useState({
    name: "",
    url: "",
    category: "",
    monthlyVisitors: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetchWebsites(publisherWallet)
        setWebsites(res.websites)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load websites")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [publisherWallet])

  const handleAddWebsite = () => {
    const submit = async () => {
      try {
        setError(null)
        const monthlyVisitors = Number(newWebsite.monthlyVisitors || 0)
        const record = await createWebsite({
          publisherWallet,
          name: newWebsite.name,
          url: newWebsite.url,
          category: newWebsite.category,
          monthlyVisitors,
        })
        setWebsites((prev) => [...prev, record])
        setIsOpen(false)
        setNewWebsite({ name: "", url: "", category: "", monthlyVisitors: "" })
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add website")
      }
    }
    void submit()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Websites</h1>
          <p className="text-muted-foreground mt-1">Manage your registered websites and dApps</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Website
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Website</DialogTitle>
              <DialogDescription>Register a new website to start displaying ads.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  placeholder="My Awesome dApp"
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-url">Site URL</Label>
                <Input
                  id="site-url"
                  placeholder="https://myapp.com"
                  value={newWebsite.url}
                  onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-category">Category</Label>
                <Select
                  value={newWebsite.category}
                  onValueChange={(value) => setNewWebsite({ ...newWebsite, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DeFi">DeFi</SelectItem>
                    <SelectItem value="NFT">NFT</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="News">News</SelectItem>
                    <SelectItem value="Developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-visitors">Monthly Visitors</Label>
                <Input
                  id="monthly-visitors"
                  type="number"
                  placeholder="50000"
                  value={newWebsite.monthlyVisitors}
                  onChange={(e) => setNewWebsite({ ...newWebsite, monthlyVisitors: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWebsite}>Add Website</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right-full">
          <Card className="border-success bg-success/10 shadow-lg">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Check className="h-5 w-5 text-success" />
              <div>
                <p className="font-semibold text-success">Website added</p>
                <p className="text-sm text-muted-foreground">Your website has been submitted for review.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registered Websites</CardTitle>
          <CardDescription>Your websites approved for ad monetization</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Monthly Visitors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Impressions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((website) => (
                <TableRow key={website.id}>
                  <TableCell className="font-medium">{website.name}</TableCell>
                  <TableCell>
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      {website.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>{website.category}</TableCell>
                  <TableCell>{website.monthlyVisitors.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={website.status} />
                  </TableCell>
                  <TableCell>{website.dailyImpressions.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
