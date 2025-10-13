"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/qr-scanner"

async function uploadFile(file: File) {
  const fd = new FormData()
  fd.set("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: fd })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function postJSON(url: string, data: any) {
  const res = await fetch(url, { method: "POST", body: JSON.stringify(data) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function EditingPage() {
  const [orderCode, setOrderCode] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [done, setDone] = useState<any>(null)
  const [useScanner, setUseScanner] = useState(false) // toggle scan/input

  return (
    <main className="container mx-auto p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Desain (Editor)</CardTitle>
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

          <Input type="file" accept=".pdf,.ai,.psd,.png,.jpg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button
            onClick={async () => {
              if (!file) return
              const u = await uploadFile(file)
              const res = await postJSON("/api/orders/attach-final", {
                order_code: orderCode,
                file_url: u.url,
                file_name: u.filename,
              })
              setDone(res)
            }}
          >
            Upload & Tandai Selesai Edit
          </Button>
          {done && <div className="text-sm text-muted-foreground">Status diperbarui: {done.status_readable}</div>}
        </CardContent>
      </Card>
    </main>
  )
}
