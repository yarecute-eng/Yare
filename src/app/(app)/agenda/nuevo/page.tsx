import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import NuevaCitaClient from "./nueva-cita-client"

export const metadata: Metadata = { title: "Agendar cita" }

export default async function NuevaCitaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const params = await searchParams

  const clientes = await prisma.cliente.findMany({
    where: {
      eliminadoEn: null,
      ...(esAdmin ? {} : { vendedorId: usuario.id }),
    },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  })

  return (
    <NuevaCitaClient
      clientes={clientes}
      clienteIdInicial={params.clienteId ?? ""}
    />
  )
}
