import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()
  const { data: idx } = await supabase
    .from("price_index")
    .select("*")
    .eq("product_type", body.jenis)
    .eq("size", body.ukuran)
    .eq("material", body.bahan)
    .maybeSingle()

  const unit = idx?.unit_price ?? 1000
  const finishing = body.finishing?.toLowerCase() !== "none" ? (idx?.finishing_price ?? 0) : 0
  const total = unit * (Number(body.jumlah) || 1) + finishing

  return NextResponse.json({ total })
}
