import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import DashboardClient from "./dashboard-client"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"

export const metadata: Metadata = { title: "Tablero" }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const vendedorId = usuario.id

  const ahora = new Date()
  const inicioMes = startOfMonth(ahora)
  const finMes = endOfMonth(ahora)

  // Filtro por vendedor si no es admin
  const filtroVendedor = esAdmin ? {} : { vendedorId }

  const [
    totalClientes,
    clientesNuevosMes,
    clientesGanados,
    citasHoy,
    pagosVencidos,
    clientesSinAccion,
    config,
    pagosDelMes,
    clientesMesAnterior,
  ] = await Promise.all([
    // Total de clientes activos
    prisma.cliente.count({
      where: { ...filtroVendedor, eliminadoEn: null, estado: "ACTIVO" },
    }),
    // Clientes nuevos este mes
    prisma.cliente.count({
      where: {
        ...filtroVendedor,
        eliminadoEn: null,
        creadoEn: { gte: inicioMes, lte: finMes },
      },
    }),
    // Clientes ganados este mes
    prisma.cliente.count({
      where: {
        ...filtroVendedor,
        eliminadoEn: null,
        estado: "GANADO",
        ganadoEn: { gte: inicioMes, lte: finMes },
      },
    }),
    // Citas de hoy
    prisma.cita.count({
      where: {
        ...(esAdmin ? {} : { vendedorId }),
        eliminadoEn: null,
        cancelada: false,
        fecha: {
          gte: new Date(ahora.toDateString()),
          lt: new Date(new Date(ahora.toDateString()).getTime() + 86400000),
        },
      },
    }),
    // Pagos vencidos
    prisma.pago.count({
      where: {
        eliminadoEn: null,
        estatus: "VENCIDO",
        ...(esAdmin ? {} : { cliente: { vendedorId } }),
      },
    }),
    // Clientes sin próxima acción
    prisma.cliente.count({
      where: {
        ...filtroVendedor,
        eliminadoEn: null,
        estado: "ACTIVO",
        proximaAccion: null,
      },
    }),
    // Configuración del negocio
    prisma.configuracionNegocio.findUnique({ where: { id: "singleton" } }),
    // Pagos cobrados este mes
    prisma.pago.aggregate({
      where: {
        eliminadoEn: null,
        estatus: "PAGADO",
        fechaPago: { gte: inicioMes, lte: finMes },
        ...(esAdmin ? {} : { cliente: { vendedorId } }),
      },
      _sum: { monto: true },
    }),
    // Clientes ganados mes anterior (para comparación)
    prisma.cliente.count({
      where: {
        ...filtroVendedor,
        eliminadoEn: null,
        estado: "GANADO",
        ganadoEn: {
          gte: startOfMonth(subMonths(ahora, 1)),
          lte: endOfMonth(subMonths(ahora, 1)),
        },
      },
    }),
  ])

  const metaMensual = config?.metaMensual ?? 10
  const porcMeta = Math.min(100, Math.round((clientesGanados / metaMensual) * 100))
  const ingresosDelMes = pagosDelMes._sum.monto ?? 0

  return (
    <DashboardClient
      stats={{
        totalClientes,
        clientesNuevosMes,
        clientesGanados,
        citasHoy,
        pagosVencidos,
        clientesSinAccion,
        metaMensual,
        porcMeta,
        ingresosDelMes,
        clientesMesAnterior,
      }}
      usuario={usuario}
    />
  )
}
