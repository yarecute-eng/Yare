import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar, BottomNav } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const usuario = {
    id: session.user.id,
    nombre: (session.user as any).nombre ?? session.user.name ?? "Usuario",
    rol: (session.user as any).rol ?? "VENDEDOR",
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar solo en desktop */}
      <div className="hidden md:block">
        <Sidebar usuario={usuario} />
      </div>

      {/* Contenido principal */}
      <div className="md:pl-[240px] flex flex-col min-h-screen">
        <Topbar usuario={usuario} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Barra inferior en móvil */}
      <BottomNav usuario={usuario} />
    </div>
  )
}
