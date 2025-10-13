"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/qr-scanner"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

async function postJSON(url: string, data: any) {
  const res = await fetch(url, { method: "POST", body: JSON.stringify(data) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

const steps = [
  { value: "ON_PROCESS_CUTTING", label: "Cutting" },
  { value: "ON_PROCESS_PRINTING", label: "Printing" },
  { value: "ON_PROCESS_FINISHING", label: "Finishing" },
  { value: "QC_CHECKING", label: "QC" },
  { value: "READY_FOR_PICKUP", label: "Packing Selesai" },
]

export default function ProductionPage() {
  const [orderCode, setOrderCode] = useState("")
  const [status, setStatus] = useState(steps[0].value)
  const [useScanner, setUseScanner] = useState(true) // default scan

  return (
    <main className="container mx-auto p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Produksi (Scan QR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div>
            <label className="text-sm">Tahap</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {steps.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={async () => {
              await postJSON("/api/tracking/update", { order_code: orderCode, status })
              alert("Status diperbarui")
            }}
          >
            Update Status
          </Button>
          <div className="text-sm text-muted-foreground">Order: {orderCode || "-"}</div>
        </CardContent>
      </Card>
    </main>
  )
}
