"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/qr-scanner"

type TrackResult = {
  order_code: string
  customer_name: string
  status_readable: string
  payment_status: string
  eta?: string | null
}

export default function UserTrackPage() {
  const [orderCode, setOrderCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TrackResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function track(code: string) {
    if (!code) return
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch("/api/orders/track", { method: "POST", body: JSON.stringify({ order_code: code }) })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setErr(e.message || "Gagal melacak")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Lacak Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Kode Order</Label>
            <Input value={orderCode} onChange={(e) => setOrderCode(e.target.value)} placeholder="CT-2025-0001" />
          </div>
          <div className="flex gap-3">
            <Button disabled={loading} onClick={() => track(orderCode)}>
              {loading ? "Memuat..." : "Lacak"}
            </Button>
            <Button variant="secondary" onClick={() => setData(null)}>
              Reset
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Atau Scan QR</Label>
            <QRScanner
              onResult={(t) => {
                setOrderCode(t)
                track(t)
              }}
            />
          </div>

          {err && <p className="text-sm text-destructive">{err}</p>}
          {data && (
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-sm text-muted-foreground">Kode</div>
              <div className="font-semibold">{data.order_code}</div>
              <div className="text-sm text-muted-foreground mt-2">Pelanggan</div>
              <div>{data.customer_name}</div>
              <div className="text-sm text-muted-foreground mt-2">Status</div>
              <div className="font-medium">{data.status_readable}</div>
              <div className="text-sm text-muted-foreground mt-2">Pembayaran</div>
              <div className="font-medium">{data.payment_status}</div>
              <div className="text-sm text-muted-foreground mt-2">Estimasi Selesai</div>
              <div>{data.eta ?? "-"}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
