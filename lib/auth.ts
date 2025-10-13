import { createClient as createServerSupabase } from "@/lib/supabase/server"
import type { UserRole } from "./types"

export async function getSessionAndRole() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { user: null, role: null as UserRole | null }

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()

  return { user, role: (profile?.role as UserRole) ?? null }
}

export function assertRole(role: string, allowed: UserRole[]) {
  if (!role || !allowed.includes(role as UserRole)) {
    const err = new Error("Forbidden")
    ;(err as any).status = 403
    throw err
  }
}
