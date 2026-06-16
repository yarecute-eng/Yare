"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  Users, Plus, Search, Filter, ChevronLeft, ChevronRight,
  Phone, Mail, Star, StarOff, Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge, TempBadge, EstadoBadge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { etapaLabel, formatFecha, diasSinContacto, formatMonto } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Cliente {
  id: string
  nombre: string
  telefono: string | null
  correo: string | null
  etapa: string
  estado: string
  temperatura: string
  valorEstimado: number | null
  proximaAccion: string | null
  proximaAccionFecha: Date | null
  ultimoContacto: Date | null
  empresa: string | null
  origen: string | null
  vendedor: { nombre: string; id: string }
  etiquetas: { etiqueta: { nombre: string; color: string } }[]
  pagos: { monto: number; estatus: string }[]
}

interface Props {
  clientes: Cliente[]
  total: number
  pagina: number
  porPagina: number
  usuario: { id: string; rol: string; nombre: string }
  vendedores: { id: string; nombre: string }[]
}

const etapas = [
  "NUEVO", "CONTACTADO", "PROPUESTA_ENVIADA", "CLIENTE_NUEVO",
  "CLIENTE_RECURRENTE", "CLIENTE_DE_TEMPORADAS", "VIP_MAYORISTA",
]

export default function ClientesClient({ clientes, total, pagina, porPagina, usuario, vendedores }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPaginas = Math.ceil(total / porPagina)

  function irA(pagina: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("pagina", String(pagina))
    router.push(`/clientes?${params.toString()}`)
  }

  function filtrarEtapa(etapa: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (etapa) params.set("etapa", etapa)
    else params.delete("etapa")
    params.set("pagina", "1")
    router.push(`/clientes?${params.toString()}`)
  }

  const etapaActiva = searchParams.get("etapa")

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          </div>
          <p className="text-sm text-gray-500">Todas tus personas en un solo lugar</p>
        </div>
        <Link href="/clientes/nuevo">
          <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
            Agregar cliente
          </Button>
        </Link>
      </div>

      {/* Filtros de etapa */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => filtrarEtapa(null)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            !etapaActiva
              ? "bg-[#a78bdb] text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
          )}
        >
          Todos ({total})
        </button>
        {etapas.map((e) => (
          <button
            key={e}
            onClick={() => filtrarEtapa(e)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              etapaActiva === e
                ? "bg-[#a78bdb] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
            )}
          >
            {etapaLabel[e]}
          </button>
        ))}
      </div>

      {/* Lista de clientes */}
      {clientes.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Sin clientes</h3>
          <p className="text-gray-500 mb-4">
            {etapaActiva ? "Ningún cliente en esta etapa." : "Aún no tienes clientes registrados."}
          </p>
          <Link href="/clientes/nuevo">
            <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
              Agregar el primero
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full hidden md:table">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Etapa</th>
                <th className="text-left px-4 py-3 font-medium">Temp.</th>
                <th className="text-left px-4 py-3 font-medium">Valor</th>
                <th className="text-left px-4 py-3 font-medium">Próxima acción</th>
                <th className="text-left px-4 py-3 font-medium">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {clientes.map((c) => {
                const dias = diasSinContacto(c.ultimoContacto)
                const accionVencida = c.proximaAccionFecha && new Date(c.proximaAccionFecha) < new Date()
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nombre={c.nombre} size="sm" />
                        <div>
                          <Link
                            href={`/clientes/${c.id}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-[#a78bdb] hover:underline cursor-pointer"
                          >
                            {c.nombre}
                          </Link>
                          {c.empresa && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {c.empresa}
                            </p>
                          )}
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {c.etiquetas.slice(0, 2).map((et) => (
                              <span
                                key={et.etiqueta.nombre}
                                className="rounded-full px-1.5 py-0.5 text-xs text-white"
                                style={{ backgroundColor: et.etiqueta.color }}
                              >
                                {et.etiqueta.nombre}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{etapaLabel[c.etapa] ?? c.etapa}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <TempBadge temp={c.temperatura} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {c.valorEstimado ? formatMonto(c.valorEstimado) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {c.proximaAccion ? (
                        <div>
                          <p className={cn("text-sm", accionVencida && "text-red-600 font-medium")}>
                            {accionVencida && "⚠️ "}
                            {c.proximaAccion.slice(0, 40)}
                            {c.proximaAccion.length > 40 && "..."}
                          </p>
                          {c.proximaAccionFecha && (
                            <p className={cn("text-xs", accionVencida ? "text-red-500" : "text-gray-400")}>
                              {formatFecha(c.proximaAccionFecha)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-500">🟠 Sin acción</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {c.telefono && (
                          <a
                            href={`https://wa.me/${c.telefono}?text=Hola ${encodeURIComponent(c.nombre)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                            title="WhatsApp"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        {c.correo && (
                          <a
                            href={`mailto:${c.correo}`}
                            className="text-blue-600 hover:text-blue-700"
                            title="Correo"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Vista de tarjetas en móvil */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {clientes.map((c) => {
              const accionVencida = c.proximaAccionFecha && new Date(c.proximaAccionFecha) < new Date()
              return (
                <Link key={c.id} href={`/clientes/${c.id}`} className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar nombre={c.nombre} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{c.nombre}</p>
                        {c.empresa && <p className="text-xs text-gray-500">{c.empresa}</p>}
                      </div>
                    </div>
                    <TempBadge temp={c.temperatura} />
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <Badge variant="default">{etapaLabel[c.etapa] ?? c.etapa}</Badge>
                    {c.valorEstimado && (
                      <Badge variant="info">{formatMonto(c.valorEstimado)}</Badge>
                    )}
                  </div>
                  {c.proximaAccion && (
                    <p className={cn("text-xs mt-2", accionVencida ? "text-red-500" : "text-gray-500")}>
                      {accionVencida && "⚠️ "}{c.proximaAccion.slice(0, 60)}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {((pagina - 1) * porPagina) + 1}–{Math.min(pagina * porPagina, total)} de {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagina <= 1}
              onClick={() => irA(pagina - 1)}
              icon={<ChevronLeft className="h-4 w-4" />}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagina >= totalPaginas}
              onClick={() => irA(pagina + 1)}
              iconRight={<ChevronRight className="h-4 w-4" />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
