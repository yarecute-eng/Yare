"use client"
import Link from "next/link"
import { Archive } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { etapaLabel, formatMonto, formatFechaCompleta } from "@/lib/utils"
import { restaurarCliente } from "@/app/actions/clientes"
import { useRouter } from "next/navigation"

interface Cliente { id: string; nombre: string; empresa: string | null; etapa: string; valorEstimado: number | null; actualizadoEn: Date; ganadoEn: Date | null; perdidoEn: Date | null; archivadoEn: Date | null; motivoPerdida: string | null; vendedor: { nombre: string } }

export default function SeccionClient({ clientes, usuario }: { clientes: Cliente[]; usuario: any }) {
  const router = useRouter()
  const total = clientes.reduce((acc, c) => acc + (c.valorEstimado ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Archive className="h-5 w-5 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Archivados</h1>
        </div>
        <p className="text-sm text-gray-500">{clientes.length} clientes · {total > 0 ? formatMonto(total) : ""}</p>
      </div>

      {clientes.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500">No hay nada archivado por ahora</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {clientes.map((c) => (
            <Card key={c.id} padding="md" className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar nombre={c.nombre} size="sm" />
                <div>
                  <Link href={"/clientes/" + c.id} className="font-medium text-gray-900 dark:text-white hover:text-[#a78bdb] hover:underline">
                    {c.nombre}
                  </Link>
                  {c.empresa && <p className="text-xs text-gray-500">{c.empresa}</p>}
                  {c.motivoPerdida && <p className="text-xs text-amber-500">Motivo: {c.motivoPerdida}</p>}
                  <p className="text-xs text-gray-400">{c.ganadoEn ? "Ganado " + formatFechaCompleta(c.ganadoEn) : c.perdidoEn ? "Perdido " + formatFechaCompleta(c.perdidoEn) : c.archivadoEn ? "Archivado " + formatFechaCompleta(c.archivadoEn) : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {c.valorEstimado && <p className="text-sm font-medium text-gray-900 dark:text-white">{formatMonto(c.valorEstimado)}</p>}
                <Button variant="ghost" size="sm" onClick={() => restaurarCliente(c.id).then(() => router.refresh())}>Reactivar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
