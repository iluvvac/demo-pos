"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { OrderQRCode } from "@/components/qr-code"

async function postJSON(url: string, data: any) {
  const res = await fetch(url, { method: "POST", body: JSON.stringify(data) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function QueuePage() {
  const [nama, setNama] = useState("")
  const [kontak, setKontak] = useState("")
  const [keperluan, setKeperluan] = useState("tanya_harga")
  const [result, setResult] = useState<any>(null)

  return (
    <main className="container mx-auto p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Registrasi Antrian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama pelanggan" />
          </div>
          <div className="space-y-2">
            <Label>Kontak (HP/WA)</Label>
            <Input value={kontak} onChange={(e) => setKontak(e.target.value)} placeholder="08xxxx" />
          </div>
          <div className="space-y-2">
            <Label>Keperluan</Label>
            <Select value={keperluan} onValueChange={setKeperluan}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih keperluan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tanya_harga">Tanya Harga</SelectItem>
                <SelectItem value="cetak">Cetak</SelectItem>
                <SelectItem value="konsultasi_desain">Konsultasi Desain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={async () => {
              const data = await postJSON("/api/queue/register", { nama, kontak, keperluan })
              setResult(data)
            }}
          >
            Ambil Nomor Antrian
          </Button>
          {result && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nomor Antrian</p>
              <div className="text-2xl font-bold">{result.queue_number}</div>
              <OrderQRCode value={result.order_code} />
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
