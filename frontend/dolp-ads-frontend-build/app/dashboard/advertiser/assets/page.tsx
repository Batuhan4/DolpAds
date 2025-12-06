"use client"

import { EmptyState } from "@/components/dashboard/empty-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload } from "lucide-react"

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Asset Library</h1>
          <p className="text-muted-foreground mt-1">Manage your banner images and creatives</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Assets</CardTitle>
          <CardDescription>All uploaded banners and creatives</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ImageIcon}
            title="No assets yet"
            description="Upload your first banner image to get started with your campaigns."
            action={{
              label: "Upload Asset",
              onClick: () => {},
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
