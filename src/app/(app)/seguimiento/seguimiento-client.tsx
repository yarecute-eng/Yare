"use client"
import Link from "next/link"
import { ListChecks, AlertCircle, Calendar, Clock, Bell, Phone, Mail, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge, TempBadge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatFecha, formatMonto, cn } from "@/lib/utils"

interface Cliente {
  id: string
  nombre: string
  telefono: string | null
  
  correo: string | null
  temperatura: string
  proximaAccion: string | null
  proximaAccionFecha: Date | null
  valorEstimado: number | null
  objecionPrincipal: string | null
  vendedor: { nombre: string }
}

interface Cita {
  id: string
  fecha: Date
  titulo: string | null
  cliente: { id: string; nombre: string }
  googleMeetLink: string | null
}

interface Recordatorio {
  id: string
  titulo: string
  fecha: Date
  cliente: { id: string; nombre: string } | null
}

interface Props {
  accionesVencidas: Cliente[]
  accionesHoy: Cliente[]
  leadsNuevos24h: number
  clientesSinAccion: number
  citasHoy: Cita[]
  recordatoriosHoy: Recordatorio[]
  metaMensual: number
  usuario: { id: string; nombre: string; rol: string }
}

export default function SeguimientoClient({
  accionesVencidas, accionesHoy, leadsNuevos24h, clientesSinAccion,
  citasHoy, recordatoriosHoy, metaMensual, usuario,
}: Props) {
  const totalPendientes = accionesVencidas.length + accionesHoy.length
  const ahora = new Date()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ListChecks className="h-5 w-5 text-amber-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seguimiento</h1>
        </div>
        <p className="text-sm text-gray-500">A quién toca contactar hoy</p>
      </div>

      {/* Alertas críticas */}
      {(leadsNuevos24h > 0 || clientesSinAccion > 0) && (
        <div className="space-y-2">
          {leadsNuevos24h > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">
                ⚠️ <strong>{leadsNuevos24h}</strong> lead{leadsNuevos24h !== 1 ? "s" : ""} sin contactar en más de 24h.{" "}
                <strong>El primero que contacta, gana.</strong>{" "}
                <Link href="/clientes?etapa=NUEVO" className="underline">Contactar ahora</Link>
              </p>
            </div>
          )}
          {clientesSinAccion > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                🟠 <strong>{clientesSinAccion}</strong> cliente{clientesSinAccion !== 1 ? "s" : ""} activo{clientesSinAccion !== 1 ? "s" : ""} sin próxima acción.{" "}
                <Link href="/clientes?sinAccion=true" className="underline">Ver cuáles son</Link>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Resumen del día */}
      <div className="grid grid-cols-3 gap-3">
        <Card padding="md" className="text-center">
          <p className="text-3xl font-bold text-red-500">{accionesVencidas.length}</p>
          <p className="text-xs text-gray-500 mt-1">Acciones vencidas</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-3xl font-bold text-[#a78bdb]">{accionesHoy.length}</p>
          <p className="text-xs text-gray-500 mt-1">Para hoy</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-3xl font-bold text-green-500">{citasHoy.length}</p>
          <p className="text-xs text-gray-500 mt-1">Citas hoy</p>
        </Card>
      </div>

      {/* Citas de hoy */}
      {citasHoy.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500" />
            Citas de hoy
          </h2>
          <div className="space-y-2">
            {citasHoy.map((cita) => (
              <Card key={cita.id} padding="md" className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 text-sm font-bold">
                    {new Date(cita.fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div>
                    <Link href={`/clientes/${cita.cliente.id}`} className="font-medium text-gray-900 dark:text-white hover:text-[#a78bdb] hover:underline">
                      {cita.cliente.nombre}
                    </Link>
                    <p className="text-xs text-gray-500">{cita.titulo ?? "Cita"}</p>
                  </div>
                </div>
                {cita.googleMeetLink && (
                  <a href={cita.googleMeetLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">Unirse al Meet</Button>
                  </a>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Acciones vencidas */}
      {accionesVencidas.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Acciones vencidas ({accionesVencidas.length})
          </h2>
          <div className="space-y-2">
            {accionesVencidas.map((c) => (
              <ClienteAccionCard key={c.id} cliente={c} vencida />
            ))}
          </div>
        </section>
      )}

      {/* Acciones de hoy */}
      {accionesHoy.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-amber-500" />
            Para hoy ({accionesHoy.length})
          </h2>
          <div className="space-y-2">
            {accionesHoy.map((c) => (
              <ClienteAccionCard key={c.id} cliente={c} />
            ))}
          </div>
        </section>
      )}

      {/* Recordatorios */}
      {recordatoriosHoy.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#a78bdb]" />
            Recordatorios ({recordatoriosHoy.length})
          </h2>
          <div className="space-y-2">
            {recordatoriosHoy.map((r) => (
              <Card key={r.id} padding="md" className={cn(
                "flex items-center gap-3",
                new Date(r.fecha) < ahora && "border-red-100 dark:border-red-800/50"
              )}>
                <Bell className={cn("h-4 w-4 shrink-0", new Date(r.fecha) < ahora ? "text-red-500" : "text-[#a78bdb]")} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.titulo}</p>
                  {r.cliente && (
                    <Link href={`/clientes/${r.cliente.id}`} className="text-xs text-gray-500 hover:text-[#a78bdb] hover:underline">
                      {r.cliente.nombre}
                    </Link>
                  )}
                </div>
                <span className="text-xs text-gray-400">{formatFecha(r.fecha)}</span>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío */}
      {totalPendientes === 0 && citasHoy.length === 0 && recordatoriosHoy.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Hoy no tienes pendientes 🎉
          </h3>
          <p className="text-gray-500 mt-1">Excelente trabajo. Puedes ir a revisar el embudo.</p>
          <div className="mt-4">
            <Link href="/embudo">
              <Button variant="primary">Ver embudo</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ClienteAccionCard({ cliente, vencida }: { cliente: Cliente; vencida?: boolean }) {
  const waUrl = `https://wa.me/${cliente.telefono}`

  return (
    <Card padding="md" className={cn(
      "border-l-4",
      vencida ? "border-l-red-500" : "border-l-amber-400"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar nombre={cliente.nombre} size="sm" />
          <div>
            <Link
              href={`/clientes/${cliente.id}`}
              className="font-medium text-gray-900 dark:text-white hover:text-[#a78bdb] hover:underline"
            >
              {cliente.nombre}
            </Link>
            {cliente.valorEstimado && (
              <p className="text-xs text-gray-500">{formatMonto(cliente.valorEstimado)}</p>
            )}
            {cliente.proximaAccion && (
              <p className={cn("text-sm mt-1", vencida ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300")}>
                {vencida && "⚠️ "}{cliente.proximaAccion}
              </p>
            )}
            {cliente.objecionPrincipal && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Objeción: {cliente.objecionPrincipal}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <TempBadge temp={cliente.temperatura} />
          <div className="flex gap-1.5">
            {cliente.telefono && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <button className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2 text-green-600 hover:bg-green-100 transition-colors" title="WhatsApp">
                  <Phone className="h-4 w-4" />
                </button>
              </a>
            )}
            {cliente.correo && (
              <a href={`mailto:${cliente.correo}`}>
                <button className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2 text-blue-600 hover:bg-blue-100 transition-colors" title="Correo">
                  <Mail className="h-4 w-4" />
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
