import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if ((session.user as any).rol !== "ADMIN") {
    redirect("/dashboard")
  }
  return session
}

// Verifica si el usuario puede hacer una acción sobre un recurso
export function puede(
  usuario: { id: string; rol: string },
  accion: "ver" | "editar" | "borrar" | "adminPanel" | "exportar",
  recurso?: { vendedorId?: string }
): boolean {
  if (usuario.rol === "ADMIN") return true
  if (accion === "adminPanel" || accion === "exportar") return false
  if (recurso?.vendedorId && recurso.vendedorId !== usuario.id) return false
  return true
}
