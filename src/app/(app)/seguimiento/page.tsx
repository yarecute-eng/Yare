import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import SeguimientoClient from "./seguimiento-client"
import { startOfDay, endOfDay } from "date-fns"

export const metadata: Metadata = { title: "Seguimiento" }

export default async function SeguimientoPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtroVendedor = esAdmin ? {} : { vendedorId: usuario.id }

  const ahora = new Date()
  const hoyInicio = startOfDay(ahora)
  const hoyFin = endOfDay(ahora)

  const [
    accionesVencidas,
    accionesHoy,
    leadsNuevos24h,
    clientesSinAccion,
    citasHoy,
    recordatoriosHoy,
    metaMensual,
  ] = await Promise.all([
    // Acciones vencidas (fecha pasada)
    prisma.cliente.findMany({
      where: {
        ...filtroVendedor,
        eliminadoEn: null,
        estado: "ACTIVO",
        proximaAccionFecha: { lt: hoyInicio },
        proximaAccion: { not: null },
      },
      include: { vendedor: { select: { nombre: true } } },
      orderBy: [{ temperatura: "asc" }, { proximaAccionFecha: "asc" }],
      take: 20,
    }),
    // Acciones de hoy
    prisma.cliente.findMany({
      where: {
        ...filtroVendedor,
        eliminadoEn: null,
        estado: "ACTIVO",
        proximaAccionFecha: { gte: hoyInicio, lte: hoyFin },
      },
      include: { vendedor: { select: { nombre: true } } },
      orderBy: [{ temperatura: "asc" }],
      take: 20,
    }),
    // Leads nuevos sin contactar en +24h
    prisma.cliente.count({
      where: {
        ...filtroVendedor,
        eliminadoEn: null,
        etapa: "NUEVO",
        ultimoContacto: null,
        creadoEn: { lt: new Date(ahora.getTime() - 24 * 3600000) },
      },
    }),
    // Sin próxima acción
    prisma.cliente.count({
      where: {
        ...filtroVendedor,
        eliminadoEn: null,
        estado: "ACTIVO",
        proximaAccion: null,
      },
    }),
    // Citas de hoy
    prisma.cita.findMany({
      where: {
        ...(esAdmin ? {} : { vendedorId: usuario.id }),
        eliminadoEn: null,
        cancelada: false,
        fecha: { gte: hoyInicio, lte: hoyFin },
      },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { fecha: "asc" },
    }),
    // Recordatorios vencidos/hoy
    prisma.recordatorio.findMany({
      where: {
        usuarioId: usuario.id,
        completado: false,
        fecha: { lte: hoyFin },
      },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { fecha: "asc" },
      take: 10,
    }),
    // Meta mensual
    prisma.configuracionNegocio.findUnique({ where: { id: "singleton" }, select: { metaMensual: true } }),
  ])

  return (
    <SeguimientoClient
      accionesVencidas={accionesVencidas}
      accionesHoy={accionesHoy}
      leadsNuevos24h={leadsNuevos24h}
      clientesSinAccion={clientesSinAccion}
      citasHoy={citasHoy}
      recordatoriosHoy={recordatoriosHoy}
      metaMensual={metaMensual?.metaMensual ?? 10}
      usuario={usuario}
    />
  )
}
