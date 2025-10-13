import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()

  await supabase.from("orders").update({ status: body.status }).eq("order_code", body.order_code)
  await supabase.from("order_tracking").insert({ order_code: body.order_code, status: body.status })

  return NextResponse.json({ ok: true })
}
