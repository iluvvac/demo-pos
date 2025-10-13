"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/qr-scanner"

async function postJSON(url: string, data: any) {
  const res = await fetch(url, { method: "POST", body: JSON.stringify(data) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function PaymentsPage() {
  const [orderCode, setOrderCode] = useState("")
  const [amount, setAmount] = useState<number>(0)
  const [method, setMethod] = useState("CASH")
  const [paidType, setPaidType] = useState<"DP" | "PAID">("PAID")
  const [done, setDone] = useState<any>(null)
  const [useScanner, setUseScanner] = useState(false)

  return (
    <main className="container mx-auto p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Pembayaran (Kasir)</CardTitle>
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

          {!useScanner ? (
            <Input placeholder="Masukkan kode order" value={orderCode} onChange={(e) => setOrderCode(e.target.value)} />
          ) : (
            <QRScanner onResult={(t) => setOrderCode(t)} />
          )}

          <Input
            placeholder="Jumlah (Rp)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number.parseInt(e.target.value || "0"))}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Metode</label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="QRIS">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Jenis</label>
              <Select value={paidType} onValueChange={(v) => setPaidType(v as "DP" | "PAID")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DP">DP</SelectItem>
                  <SelectItem value="PAID">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={async () => {
              const res = await postJSON("/api/payments/create", {
                order_code: orderCode,
                amount,
                method,
                paid_type: paidType,
              })
              setDone(res)
            }}
          >
            Simpan Pembayaran
          </Button>
          {done && (
            <div className="text-sm text-muted-foreground">Pembayaran tersimpan. Status: {done.status_readable}</div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
