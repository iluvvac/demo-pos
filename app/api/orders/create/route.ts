import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()

  const { data: q } = await supabase
    .from("queues")
    .select("id, order_code, customer_id")
    .eq("queue_number", body.queue_number)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!q) return NextResponse.json({ error: "Queue not found" }, { status: 404 })

  const status = body.price ? "MENUNGGU_FILE_DESAIN" : "INQUIRY"

  const { data: order } = await supabase
    .from("orders")
    .insert({
      order_code: q.order_code,
      customer_id: q.customer_id,
      product_type: body.jenis,
      size: body.ukuran,
      quantity: body.jumlah,
      material: body.bahan,
      finishing: body.finishing,
      notes: body.catatan,
      price: body.price ?? 0,
      payment_status: "UNPAID",
      status,
    })
    .select("*")
    .single()

  await supabase.from("order_tracking").insert({
    order_code: order.order_code,
    status,
  })

  return NextResponse.json({ order_code: order.order_code, status_readable: statusToReadable(status) })
}

function statusToReadable(s: string) {
  const map: Record<string, string> = {
    ANTRIAN_BARU: "Antrian Baru",
    INQUIRY: "Inquiry",
    MENUNGGU_FILE_DESAIN: "Menunggu File/Desain",
  }
  return map[s] ?? s
}
