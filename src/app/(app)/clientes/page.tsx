import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import ClientesClient from "./clientes-client"

export const metadata: Metadata = { title: "Clientes" }

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ etapa?: string; estado?: string; q?: string; pagina?: string; sinAccion?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const params = await searchParams
  const pagina = parseInt(params.pagina ?? "1")
  const porPagina = 25
  const skip = (pagina - 1) * porPagina

  const filtros: any = {
    eliminadoEn: null,
    estado: params.estado ?? "ACTIVO",
    ...(esAdmin ? {} : { vendedorId: usuario.id }),
  }

  if (params.etapa) filtros.etapa = params.etapa
  if (params.sinAccion === "true") filtros.proximaAccion = null
  if (params.q) {
    filtros.OR = [
      { nombre: { contains: params.q } },
      { telefono: { contains: params.q } },
      { correo: { contains: params.q } },
      { empresa: { contains: params.q } },
    ]
  }

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where: filtros,
      orderBy: [
        { proximaAccionFecha: "asc" },
        { actualizadoEn: "desc" },
      ],
      include: {
        vendedor: { select: { nombre: true, id: true } },
        etiquetas: { include: { etiqueta: true } },
        pagos: {
          where: { eliminadoEn: null },
          select: { monto: true, estatus: true },
        },
      },
      skip,
      take: porPagina,
    }),
    prisma.cliente.count({ where: filtros }),
  ])

  const vendedores = esAdmin
    ? await prisma.usuario.findMany({ where: { activo: true }, select: { id: true, nombre: true } })
    : []

  return (
    <ClientesClient
      clientes={clientes}
      total={total}
      pagina={pagina}
      porPagina={porPagina}
      usuario={usuario}
      vendedores={vendedores}
    />
  )
}
