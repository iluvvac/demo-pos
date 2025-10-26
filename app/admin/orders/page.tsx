"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useSWR from "swr";

async function postJSON(url: string, data: any) {
  const res = await fetch(url, { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function OrdersPage() {
  const [queueNumber, setQueueNumber] = useState("");
  const [jenis, setJenis] = useState("print-digital");
  const [ukuran, setUkuran] = useState("A4");
  const [jumlah, setJumlah] = useState(1);
  const [bahan, setBahan] = useState("HVS 80gsm");
  const [finishing, setFinishing] = useState("None");
  const [catatan, setCatatan] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [created, setCreated] = useState<any>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const { data: recent } = useSWR<{
    queues: { queue_number: string; order_code: string }[];
  }>("/api/queue/list", (url) => fetch(url).then((r) => r.json()));

  return (
    <main className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Input Order (CS/Editor)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Disabled Branch Input */}
          <div className="space-y-2">
            <Label>Cabang</Label>
            <Input
              value="Kelapa Gading"
              disabled
              className="bg-gray-100 text-gray-500 border border-gray-200 disabled:cursor-not-allowed"
            />
          </div>

          {/* Recent queue helper */}
          <div className="space-y-2">
            <Label>Pilih dari Antrian Terbaru</Label>
            <Select onValueChange={(v) => setQueueNumber(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih nomor antrian (opsional)" />
              </SelectTrigger>
              <SelectContent>
                {(recent?.queues ?? []).slice(0, 50).map((q) => (
                  <SelectItem key={q.order_code} value={q.queue_number}>
                    {q.queue_number} — {q.order_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Original queue input */}
          <div className="space-y-2">
            <Label>Nomor Antrian</Label>
            <Input
              value={queueNumber}
              onChange={(e) => setQueueNumber(e.target.value)}
              placeholder="A-001"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Jenis Produk</Label>
              <Select value={jenis} onValueChange={setJenis}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="print-digital">Print Digital</SelectItem>
                  <SelectItem value="sticker">Sticker</SelectItem>
                  <SelectItem value="spanduk">Spanduk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ukuran</Label>
              <Select value={ukuran} onValueChange={setUkuran}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input
                type="number"
                value={jumlah}
                onChange={(e) =>
                  setJumlah(Number.parseInt(e.target.value || "1"))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Bahan</Label>
              <Input value={bahan} onChange={(e) => setBahan(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Finishing</Label>
              <Input
                value={finishing}
                onChange={(e) => setFinishing(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Detail lain..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={async () => {
                const res = await postJSON("/api/orders/calc-price", {
                  jenis,
                  ukuran,
                  jumlah,
                  bahan,
                  finishing,
                });
                setPrice(res.total);
              }}
            >
              Hitung Harga
            </Button>
            {price !== null && (
              <div className="text-lg font-semibold">
                Rp {price.toLocaleString("id-ID")}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={async () => {
                setErrMsg(null);
                try {
                  const res = await postJSON("/api/orders/create", {
                    queue_number: queueNumber,
                    jenis,
                    ukuran,
                    jumlah,
                    bahan,
                    finishing,
                    catatan,
                    price,
                    cabang: "Kelapa Gading", // optional if you want to send it to backend
                  });
                  setCreated(res);
                } catch (e: any) {
                  const msg =
                    typeof e?.message === "string"
                      ? e.message
                      : "Gagal membuat order. Pastikan nomor antrian sudah dibuat di menu Antrian.";
                  setErrMsg(msg);
                }
              }}
            >
              Simpan Order
            </Button>
          </div>

          {errMsg && <div className="text-sm text-red-500">{errMsg}</div>}
          {created && (
            <div className="text-sm text-muted-foreground">
              Order dibuat: {created.order_code} – Status:{" "}
              {created.status_readable}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
