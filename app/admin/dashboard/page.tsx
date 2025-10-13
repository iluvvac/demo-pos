"use client"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import type { DashboardMetrics } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const { data: metrics } = useSWR<DashboardMetrics>("/api/dashboard/metrics", fetcher, { refreshInterval: 5000 })
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("orders-tracking")
      .on("postgres_changes", { event: "*", schema: "public", table: "order_tracking" }, (payload) => {
        // Fetch latest snapshot after updates
        fetch("/api/dashboard/orders")
          .then((r) => r.json())
          .then(setRows)
      })
      .subscribe()
    fetch("/api/dashboard/orders")
      .then((r) => r.json())
      .then(setRows)
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <main className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total Order" value={metrics?.total_orders ?? 0} />
          <Stat label="Selesai Hari Ini" value={metrics?.done_today ?? 0} />
          <Stat label="Sedang Proses" value={metrics?.in_progress ?? 0} />
          <Stat label="Tertunda" value={metrics?.delayed ?? 0} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking Realtime</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pembayaran</TableHead>
                <TableHead>Estimasi</TableHead>
                <TableHead>Petugas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.order_code}>
                  <TableCell>{r.order_code}</TableCell>
                  <TableCell>{r.customer_name}</TableCell>
                  <TableCell>{r.status_readable}</TableCell>
                  <TableCell>{r.payment_status}</TableCell>
                  <TableCell>{r.eta ?? "-"}</TableCell>
                  <TableCell>{r.handled_by ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-md bg-secondary">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}
