import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import SeccionClient from "./archivados-client"

export const metadata: Metadata = { title: "Archivados" }

export default async function ArchivadosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtroVendedor = esAdmin ? {} : { vendedorId: usuario.id }

  const clientes = await prisma.cliente.findMany({
    where: { ...filtroVendedor, eliminadoEn: null, estado: "ARCHIVADO" },
    include: { vendedor: { select: { nombre: true } }, etiquetas: { include: { etiqueta: true } } },
    orderBy: { actualizadoEn: "desc" },
    take: 50,
  })

  return <SeccionClient clientes={clientes} usuario={usuario} />
}
