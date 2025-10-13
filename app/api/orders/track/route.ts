import { NextResponse } from "next/server"
import { createClient as createServerSupabase } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const order_code = (body?.order_code || "").toString().trim()
  if (!order_code) {
    return new NextResponse("order_code diperlukan", { status: 400 })
  }

  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("orders_view") // prefer a view if exists; fallback to join below if not
    .select("*")
    .eq("order_code", order_code)
    .maybeSingle()

  if (error && error.code === "42P01") {
    // Fallback join if view doesn't exist
    const { data: fallback, error: err2 } = await supabase.rpc("orders_track_snapshot", { p_order_code: order_code }) // optional stored func
    if (err2 || !fallback) {
      return NextResponse.json({ error: err2?.message || "Tidak ditemukan" }, { status: 404 })
    }
    return NextResponse.json(fallback)
  }

  if (!data) {
    return new NextResponse("Tidak ditemukan", { status: 404 })
  }

  // Sanitize returned fields
  const { order_code: code, customer_name, status_readable, payment_status, eta } = data as any

  return NextResponse.json({ order_code: code, customer_name, status_readable, payment_status, eta })
}
