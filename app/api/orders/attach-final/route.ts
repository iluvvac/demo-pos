import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()

  await supabase.from("order_files").insert({
    order_code: body.order_code,
    file_url: body.file_url,
    file_name: body.file_name,
    kind: "FINAL",
  })

  await supabase.from("orders").update({ status: "SELESAI_EDIT_MENUNGGU_PEMBAYARAN" }).eq("order_code", body.order_code)

  await supabase.from("order_tracking").insert({
    order_code: body.order_code,
    status: "SELESAI_EDIT_MENUNGGU_PEMBAYARAN",
  })

  return NextResponse.json({ ok: true, status_readable: "Selesai Edit – Menunggu Pembayaran" })
}
