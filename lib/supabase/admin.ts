import { createServerClient } from "@supabase/ssr"

export async function createServiceRoleClient() {
  // We don't need cookie handling here since we're only using admin endpoints.
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // no-op
      },
    },
  })
}
