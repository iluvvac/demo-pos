import { type NextRequest, NextResponse } from "next/server"
import { createClient as createServerSupabase } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  const url = new URL("/auth/login", req.url)
  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } })
}
