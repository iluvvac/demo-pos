import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function genQueueNumber() {
  const n = Math.floor(Math.random() * 900 + 100)
  return `A-${n}`
}

function genOrderCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  const t = Date.now().toString().slice(-4)
  return `ORD-${t}-${rand}`
}

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from("customers")
    .upsert({ name: body.nama, phone: body.kontak }, { onConflict: "phone", ignoreDuplicates: false })
    .select("*")
    .order("id", { ascending: false })
    .limit(1)
    .single()

  const queue_number = genQueueNumber()
  const order_code = genOrderCode()

  await supabase.from("queues").insert({
    customer_id: customer?.id,
    queue_number,
    purpose: body.keperluan,
    status: "ANTRIAN_BARU",
    order_code,
  })

  return NextResponse.json({
    queue_number,
    order_code,
    status_readable: "Antrian Baru",
  })
}
