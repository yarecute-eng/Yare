"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  useDraggable, useDroppable, closestCenter,
} from "@dnd-kit/core"
import { KanbanSquare, Trophy, XCircle, Archive, Clock, AlertCircle } from "lucide-react"
import { Badge, TempBadge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { etapaLabel, formatMonto, diasSinContacto, cn } from "@/lib/utils"
import { moverEtapa } from "@/app/actions/clientes"
import { useToast } from "@/components/ui/toast"

const etapasActivas = [
  "NUEVO", "CONTACTADO", "PROPUESTA_ENVIADA", "CLIENTE_NUEVO",
  "CLIENTE_RECURRENTE", "CLIENTE_DE_TEMPORADAS", "VIP_MAYORISTA",
]

interface Cliente {
  id: string
  nombre: string
  telefono: string | null
  etapa: string
  temperatura: string
  valorEstimado: number | null
  proximaAccion: string | null
  proximaAccionFecha: Date | null
  ultimoContacto: Date | null
  actualizadoEn: Date
  etiquetas: { etiqueta: { nombre: string; color: string } }[]
  pagos: { monto: number; estatus: string }[]
  vendedor: { nombre: string }
}

interface Props {
  clientes: Cliente[]
  usuario: { id: string; rol: string; nombre: string }
  umbralDias: number
}

export default function EmbudoClient({ clientes: inicial, usuario, umbralDias }: Props) {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [clientes, setClientes] = useState(inicial)
  const [dragging, setDragging] = useState<Cliente | null>(null)

  const clientesPorEtapa = (etapa: string) =>
    clientes.filter((c) => c.etapa === etapa)

  const sumaPorEtapa = (etapa: string) =>
    clientesPorEtapa(etapa).reduce((acc, c) => acc + (c.valorEstimado ?? 0), 0)

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setDragging(null)
    if (!over || active.id === over.id) return

    const clienteId = String(active.id)
    const nuevaEtapa = String(over.id)
    if (!etapasActivas.includes(nuevaEtapa)) return

    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente || cliente.etapa === nuevaEtapa) return

    // Optimistic update
    setClientes((prev) =>
      prev.map((c) => (c.id === clienteId ? { ...c, etapa: nuevaEtapa } : c))
    )

    const result = await moverEtapa(clienteId, nuevaEtapa)
    if (result.error) {
      showError(result.error)
      setClientes((prev) =>
        prev.map((c) => (c.id === clienteId ? { ...c, etapa: cliente.etapa } : c))
      )
    } else {
      success(`${cliente.nombre} movido a ${etapaLabel[nuevaEtapa]}`)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const cliente = clientes.find((c) => c.id === event.active.id)
    if (cliente) setDragging(cliente)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <KanbanSquare className="h-5 w-5 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Embudo</h1>
          </div>
          <p className="text-sm text-gray-500">Mueve a cada cliente hacia la venta</p>
        </div>
        {/* Accesos rápidos */}
        <div className="flex gap-2">
          <Link href="/completados">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors">
              <Trophy className="h-3.5 w-3.5" /> Completados
            </button>
          </Link>
          <Link href="/perdidos">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200 transition-colors">
              <XCircle className="h-3.5 w-3.5" /> Perdidos
            </button>
          </Link>
          <Link href="/archivados">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200 transition-colors">
              <Archive className="h-3.5 w-3.5" /> Archivados
            </button>
          </Link>
        </div>
      </div>

      {/* Tablero kanban */}
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3" style={{ minWidth: etapasActivas.length * 280 + "px" }}>
            {etapasActivas.map((etapa) => (
              <Columna
                key={etapa}
                etapa={etapa}
                clientes={clientesPorEtapa(etapa)}
                suma={sumaPorEtapa(etapa)}
                umbralDias={umbralDias}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {dragging && <TarjetaCliente cliente={dragging} umbralDias={umbralDias} overlay />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function Columna({ etapa, clientes, suma, umbralDias }: {
  etapa: string
  clientes: Cliente[]
  suma: number
  umbralDias: number
}) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl w-[272px] shrink-0",
        "bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800",
        isOver && "border-[#a78bdb] bg-[#a78bdb]/5"
      )}
    >
      {/* Header columna */}
      <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
            {etapaLabel[etapa]}
          </h3>
          <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
            {clientes.length}
          </span>
        </div>
        {suma > 0 && (
          <p className="text-xs text-gray-500">
            {formatMonto(suma)} en esta etapa
          </p>
        )}
      </div>

      {/* Tarjetas */}
      <div className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
        {clientes.length === 0 ? (
          <div className="text-center py-8 text-gray-300 dark:text-gray-700 text-xs">
            Sin clientes
          </div>
        ) : (
          clientes.map((c) => (
            <TarjetaCliente key={c.id} cliente={c} umbralDias={umbralDias} />
          ))
        )}
      </div>
    </div>
  )
}

function TarjetaCliente({ cliente, umbralDias, overlay }: {
  cliente: Cliente
  umbralDias: number
  overlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: cliente.id })

  const diasSinMover = Math.floor(
    (Date.now() - new Date(cliente.actualizadoEn).getTime()) / 86400000
  )
  const estancado = diasSinMover >= umbralDias
  const accionVencida = cliente.proximaAccionFecha && new Date(cliente.proximaAccionFecha) < new Date()

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800",
        "p-3 cursor-grab active:cursor-grabbing select-none",
        "hover:border-[#a78bdb]/40 hover:shadow-sm transition-all",
        isDragging && "opacity-40",
        overlay && "shadow-xl rotate-1 cursor-grabbing"
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <Avatar nombre={cliente.nombre} size="sm" />
        <div className="flex-1 min-w-0">
          <Link
            href={`/clientes/${cliente.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#a78bdb] hover:underline truncate block"
          >
            {cliente.nombre}
          </Link>
          {cliente.valorEstimado && (
            <p className="text-xs text-gray-500">{formatMonto(cliente.valorEstimado)}</p>
          )}
        </div>
        <TempBadge temp={cliente.temperatura} />
      </div>

      {/* Badges de alerta */}
      <div className="flex gap-1 flex-wrap">
        {estancado && (
          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full px-2 py-0.5">
            <Clock className="h-3 w-3" />
            {diasSinMover}d sin avanzar
          </span>
        )}
        {accionVencida && (
          <span className="inline-flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full px-2 py-0.5">
            <AlertCircle className="h-3 w-3" />
            Acción vencida
          </span>
        )}
      </div>

      {cliente.etiquetas.slice(0, 2).map((et) => (
        <span
          key={et.etiqueta.nombre}
          className="inline-block rounded-full px-1.5 py-0.5 text-xs text-white mr-1 mt-1"
          style={{ backgroundColor: et.etiqueta.color }}
        >
          {et.etiqueta.nombre}
        </span>
      ))}
    </div>
  )
}
