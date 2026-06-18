import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { Calendar, Bell, Plus, Video, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Agenda — Princessitas Ceremonias" }

function formatDiaHeader(fecha: Date): string {
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(hoy.getDate() + 1)
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  const isHoy = fecha.toDateString() === hoy.toDateString()
  const isManana = fecha.toDateString() === manana.toDateString()
  const prefix = isHoy ? "Hoy, " : isManana ? "Mañana, " : ""
  return `${prefix}${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}`
}

function formatHora(fecha: Date): string {
  return new Date(fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
}

function isoDay(fecha: Date): string {
  return new Date(fecha).toISOString().slice(0, 10)
}

type Evento =
  | { tipo: "cita"; id: string; fecha: Date; titulo: string | null; cliente: { id: string; nombre: string }; googleMeetLink: string | null; confirmada: boolean; duracion: number }
  | { tipo: "recordatorio"; id: string; fecha: Date; titulo: string; cliente: { id: string; nombre: string } | null }

export default async function AgendaPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const ahora = new Date()
  const en30Dias = new Date()
  en30Dias.setDate(ahora.getDate() + 30)

  const citaWhere: any = {
    cancelada: false,
    eliminadoEn: null,
    fecha: { gte: ahora, lte: en30Dias },
  }
  if (!esAdmin) citaWhere.vendedorId = usuario.id

  const [citas, recordatorios] = await Promise.all([
    prisma.cita.findMany({
      where: citaWhere,
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { fecha: "asc" },
    }),
    prisma.recordatorio.findMany({
      where: {
        usuarioId: usuario.id,
        completado: false,
        fecha: { gte: ahora, lte: en30Dias },
      },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { fecha: "asc" },
    }),
  ])

  // Combine and group by day
  const eventos: Evento[] = [
    ...citas.map((c): Evento => ({
      tipo: "cita",
      id: c.id,
      fecha: c.fecha,
      titulo: c.titulo,
      cliente: c.cliente,
      googleMeetLink: c.googleMeetLink,
      confirmada: c.confirmada,
      duracion: c.duracion,
    })),
    ...recordatorios.map((r): Evento => ({
      tipo: "recordatorio",
      id: r.id,
      fecha: r.fecha,
      titulo: r.titulo,
      cliente: r.cliente,
    })),
  ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  // Group by ISO day
  const porDia = new Map<string, Evento[]>()
  for (const ev of eventos) {
    const key = isoDay(ev.fecha)
    if (!porDia.has(key)) porDia.set(key, [])
    porDia.get(key)!.push(ev)
  }

  const dias = Array.from(porDia.entries())

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>
        <Link href="/clientes">
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
            Nueva cita
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {dias.length === 0 && (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Calendar className="h-12 w-12 text-gray-200 dark:text-gray-700" />
            <h3 className="font-medium text-gray-600 dark:text-gray-400">
              No tienes eventos próximos
            </h3>
            <p className="text-sm text-gray-400">¡A prospectar!</p>
            <Link href="/clientes">
              <Button variant="secondary" size="sm">Ver clientes</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Events grouped by day */}
      {dias.map(([dia, evs]) => {
        const fechaDia = new Date(dia + "T12:00:00")
        return (
          <section key={dia} className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize px-1">
              {formatDiaHeader(fechaDia)}
            </h2>
            <div className="space-y-2">
              {evs.map((ev) => {
                if (ev.tipo === "cita") {
                  return (
                    <Card key={`cita-${ev.id}`} padding="md" className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-bold leading-tight",
                        ev.confirmada
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                      )}>
                        {formatHora(ev.fecha)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/clientes/${ev.cliente.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-[#a78bdb] hover:underline"
                        >
                          {ev.cliente.nombre}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ev.titulo ?? "Cita"}
                          {ev.duracion > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 text-gray-400">
                              <Clock className="h-3 w-3" />{ev.duracion} min
                            </span>
                          )}
                        </p>
                        {ev.confirmada && (
                          <span className="mt-1 inline-block rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400">
                            Confirmada
                          </span>
                        )}
                      </div>
                      {ev.googleMeetLink && (
                        <a href={ev.googleMeetLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" icon={<Video className="h-3.5 w-3.5" />}>
                            Meet
                          </Button>
                        </a>
                      )}
                    </Card>
                  )
                } else {
                  return (
                    <Card key={`rec-${ev.id}`} padding="md" className="flex items-start gap-3 border-l-4 border-l-[#a78bdb]">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#a78bdb]/10">
                        <Bell className="h-4 w-4 text-[#a78bdb]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">{ev.titulo}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{formatHora(ev.fecha)}</span>
                          {ev.cliente && (
                            <Link
                              href={`/clientes/${ev.cliente.id}`}
                              className="text-xs text-gray-500 hover:text-[#a78bdb] hover:underline"
                            >
                              · {ev.cliente.nombre}
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                }
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
