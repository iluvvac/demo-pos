import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from("orders_view").select("*").order("created_at", { ascending: false }).limit(200)

  return NextResponse.json(data ?? [])
}
