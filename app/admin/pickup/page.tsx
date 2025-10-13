"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { QRScanner } from "@/components/qr-scanner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

async function postJSON(url: string, data: any) {
  const res = await fetch(url, { method: "POST", body: JSON.stringify(data) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function PickupPage() {
  const [orderCode, setOrderCode] = useState("")
  const [verified, setVerified] = useState<any>(null)
  const [useScanner, setUseScanner] = useState(true)

  return (
    <main className="container mx-auto p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Pengambilan (Gudang)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              className={`px-3 py-1 rounded border ${!useScanner ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setUseScanner(false)}
            >
              Input Kode
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded border ${useScanner ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setUseScanner(true)}
            >
              Scan QR
            </button>
          </div>

          {useScanner ? (
            <QRScanner onResult={(t) => setOrderCode(t)} />
          ) : (
            <Input placeholder="Masukkan kode order" value={orderCode} onChange={(e) => setOrderCode(e.target.value)} />
          )}

          <div className="text-sm text-muted-foreground">Order: {orderCode}</div>
          <Button
            onClick={async () => {
              const res = await postJSON("/api/pickup/verify", { order_code: orderCode })
              setVerified(res)
            }}
          >
            Verifikasi & Serahkan
          </Button>
          {verified && <div className="text-sm">Status: {verified.status_readable}</div>}
        </CardContent>
      </Card>
    </main>
  )
}
