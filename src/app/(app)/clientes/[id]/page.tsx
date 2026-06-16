import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Metadata } from "next"
import ExpedienteClient from "./expediente-client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const cliente = await prisma.cliente.findUnique({ where: { id }, select: { nombre: true } })
  return { title: cliente?.nombre ?? "Expediente" }
}

export default async function ExpedientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any

  const cliente = await prisma.cliente.findUnique({
    where: { id, eliminadoEn: null },
    include: {
      vendedor: { select: { id: true, nombre: true } },
      pagos: { where: { eliminadoEn: null }, orderBy: { creadoEn: "desc" } },
      citas: { where: { eliminadoEn: null }, orderBy: { fecha: "desc" } },
      archivos: { orderBy: { creadoEn: "desc" } },
      eventos: { orderBy: { fecha: "desc" }, take: 30 },
      etiquetas: { include: { etiqueta: true } },
      recordatorios: { where: { completado: false }, orderBy: { fecha: "asc" } },
    },
  })

  if (!cliente) notFound()

  // Verificar permisos
  if (usuario.rol !== "ADMIN" && cliente.vendedorId !== usuario.id) {
    redirect("/clientes")
  }

  const config = await prisma.configuracionNegocio.findUnique({ where: { id: "singleton" } })

  return (
    <ExpedienteClient
      cliente={cliente}
      usuario={usuario}
      config={config}
    />
  )
}
