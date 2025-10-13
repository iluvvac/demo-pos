import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()

  await supabase.from("payments").insert({
    order_code: body.order_code,
    amount: body.amount,
    method: body.method,
    kind: body.paid_type, // DP/PAID
  })

  const nextStatus = "SUDAH_DIBAYAR_MENUNGGU_PRODUKSI"

  await supabase
    .from("orders")
    .update({
      payment_status: body.paid_type === "PAID" ? "PAID" : "DP",
      status: nextStatus,
    })
    .eq("order_code", body.order_code)

  await supabase.from("order_tracking").insert({
    order_code: body.order_code,
    status: nextStatus,
  })

  return NextResponse.json({ ok: true, status_readable: "Sudah Dibayar – Menunggu Produksi" })
}
