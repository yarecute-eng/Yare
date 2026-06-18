import { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CompartirClient from "./compartir-client"

export const metadata: Metadata = {
  title: "Compartir y crece | Princessitas Ceremonias",
}

export default async function CompartirPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const usuario = session.user as { id: string; rol: string; nombre: string }
  const esAdmin = usuario.rol === "ADMIN"

  const [config, usuarioActual, vendedoresConSlug] = await Promise.all([
    prisma.configuracionNegocio.findUnique({ where: { id: "singleton" } }),
    prisma.usuario.findUnique({
      where: { id: usuario.id },
      select: { id: true, slugAgenda: true },
    }),
    esAdmin
      ? prisma.usuario.findMany({
          where: { slugAgenda: { not: null } },
          select: { nombre: true, slugAgenda: true },
          orderBy: { nombre: "asc" },
        })
      : Promise.resolve([]),
  ])

  const vendedores = (vendedoresConSlug as { nombre: string; slugAgenda: string | null }[])
    .filter((v): v is { nombre: string; slugAgenda: string } => v.slugAgenda !== null)

  return (
    <CompartirClient
      baseUrl="https://princessitas.mx"
      slugAgenda={usuarioActual?.slugAgenda ?? null}
      vendedores={vendedores}
      negocioNombre={config?.nombre ?? "Princessitas Ceremonias"}
      esAdmin={esAdmin}
    />
  )
}
