import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/admin"

export async function POST() {
  try {
    const supa = await createServiceRoleClient()
    const email = "admin@local"
    const password = "d@lt3k"

    // Create or ensure the admin user exists with role metadata
    const createRes = await supa.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "ADMIN" },
    })

    let userId = createRes.data.user?.id
    // If user already exists, look them up to get the ID
    if (!userId) {
      const list = await supa.auth.admin.listUsers({ page: 1, perPage: 1000 })
      userId = list.data.users.find((u) => u.email === email)?.id
    }

    if (userId) {
      // Ensure profiles row exists and is ADMIN
      await supa.from("profiles").upsert({ user_id: userId, role: "ADMIN" }, { onConflict: "user_id" })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to ensure admin"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
