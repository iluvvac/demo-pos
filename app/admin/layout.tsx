import type { ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getSessionAndRole } from "@/lib/auth"
import { cn } from "@/lib/utils"

const STAFF_ROLES = ["ADMIN", "CS", "EDITOR", "KASIR", "PRODUKSI", "GUDANG"] as const

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, role } = await getSessionAndRole()
  if (!user || !role || !STAFF_ROLES.includes(role as any)) {
    redirect("/auth/login")
  }

  const nav = [
    { href: "/admin/queue", label: "Antrian" },
    { href: "/admin/orders", label: "Order" },
    { href: "/admin/editing", label: "Editing" },
    { href: "/admin/payments", label: "Pembayaran" },
    { href: "/admin/production", label: "Produksi" },
    { href: "/admin/pickup", label: "Pengambilan" },
    { href: "/admin/dashboard", label: "Dashboard" },
  ]

  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="font-semibold">
            Panel Admin
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={cn("hover:underline")}>
                {n.label}
              </Link>
            ))}
            <Link href="/auth/logout" className="text-red-600 hover:underline">
              Logout
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}
