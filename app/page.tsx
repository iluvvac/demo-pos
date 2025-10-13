import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  const links = [
    { href: "/user", title: "Untuk Pelanggan (Lacak Pesanan)" },
    { href: "/admin/dashboard", title: "Untuk Admin/Staff" },
  ]
  return (
    <main className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-pretty">Percetakan Order Journey</h1>
        <p className="text-muted-foreground">Pilih tampilan pengguna atau admin.</p>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((l) => (
          <Card key={l.href}>
            <CardHeader>
              <CardTitle className="text-pretty">{l.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={l.href}>Buka</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
