import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import PagosClient from "./pagos-client"

export const metadata: Metadata = { title: "Pagos" }

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ estatus?: string; pagina?: string }>
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
    ...(esAdmin ? {} : { cliente: { vendedorId: usuario.id } }),
  }
  if (params.estatus) filtros.estatus = params.estatus

  const [pagos, total, resumen] = await Promise.all([
    prisma.pago.findMany({
      where: filtros,
      include: {
        cliente: { select: { id: true, nombre: true, vendedor: { select: { nombre: true } } } },
      },
      orderBy: { creadoEn: "desc" },
      skip,
      take: porPagina,
    }),
    prisma.pago.count({ where: filtros }),
    prisma.pago.groupBy({
      by: ["estatus"],
      where: { eliminadoEn: null, ...(esAdmin ? {} : { cliente: { vendedorId: usuario.id } }) },
      _sum: { monto: true },
      _count: true,
    }),
  ])

  return (
    <PagosClient
      pagos={pagos}
      total={total}
      pagina={pagina}
      porPagina={porPagina}
      resumen={resumen}
      usuario={usuario}
    />
  )
}
