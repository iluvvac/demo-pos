import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()

  // Check payment is full or allow DP-based pickup if policy says so
  const { data: order } = await supabase
    .from("orders")
    .select("payment_status")
    .eq("order_code", body.order_code)
    .maybeSingle()
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.payment_status !== "PAID") {
    // allow with warning? Keep strict:
    return NextResponse.json({ error: "Belum lunas" }, { status: 400 })
  }

  await supabase.from("orders").update({ status: "BARANG_SUDAH_DIAMBIL" }).eq("order_code", body.order_code)
  await supabase.from("order_tracking").insert({ order_code: body.order_code, status: "BARANG_SUDAH_DIAMBIL" })

  return NextResponse.json({ ok: true, status_readable: "Barang Sudah Diambil" })
}
