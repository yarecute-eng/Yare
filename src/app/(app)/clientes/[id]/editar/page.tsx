import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Metadata } from "next"
import EditarClienteClient from "./editar-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    select: { nombre: true },
  })
  return { title: cliente ? `Editar - ${cliente.nombre}` : "Editar cliente" }
}

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any

  const cliente = await prisma.cliente.findUnique({
    where: { id, eliminadoEn: null },
    include: {
      vendedor: { select: { id: true, nombre: true } },
    },
  })

  if (!cliente) notFound()

  if (usuario.rol !== "ADMIN" && cliente.vendedorId !== usuario.id) {
    redirect(`/clientes/${id}`)
  }

  return <EditarClienteClient cliente={cliente} />
}
