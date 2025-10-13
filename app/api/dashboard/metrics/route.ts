import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { count: total } = await supabase.from("orders").select("*", { count: "exact", head: true })
  const { count: inProgress } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", [
      "MENUNGGU_FILE_DESAIN",
      "SELESAI_EDIT_MENUNGGU_PEMBAYARAN",
      "SUDAH_DIBAYAR_MENUNGGU_PRODUKSI",
      "ON_PROCESS_CUTTING",
      "ON_PROCESS_PRINTING",
      "ON_PROCESS_FINISHING",
      "QC_CHECKING",
    ])

  const todayISO = new Date().toISOString().slice(0, 10)
  const { count: doneToday } = await supabase
    .from("order_tracking")
    .select("*", { count: "exact", head: true })
    .eq("status", "BARANG_SUDAH_DIAMBIL")
    .gte("created_at", `${todayISO}T00:00:00Z`)

  // A simple "delayed" heuristic: tracking last update older than 6 hours and not finished
  const { data: slowOrders } = await supabase
    .from("orders")
    .select("order_code, updated_at, status")
    .neq("status", "BARANG_SUDAH_DIAMBIL")

  const delayed = (slowOrders ?? []).filter((o) => {
    const updated = new Date(o.updated_at ?? Date.now())
    return Date.now() - updated.getTime() > 6 * 3600 * 1000
  }).length

  return NextResponse.json({
    total_orders: total ?? 0,
    in_progress: inProgress ?? 0,
    done_today: doneToday ?? 0,
    delayed,
  })
}
