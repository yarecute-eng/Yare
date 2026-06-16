"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Wallet, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMonto, formatFechaCompleta, cn } from "@/lib/utils"

interface Pago {
  id: string
  monto: number
  metodo: string
  estatus: string
  concepto: string | null
  fechaPago: Date | null
  fechaVencimiento: Date | null
  folio: string
  cliente: { id: string; nombre: string; vendedor: { nombre: string } }
}

interface Props {
  pagos: Pago[]
  total: number
  pagina: number
  porPagina: number
  resumen: { estatus: string; _sum: { monto: number | null }; _count: number }[]
  usuario: { id: string; rol: string }
}

const metodosLabel: Record<string, string> = {
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  LIGA_DE_PAGO: "Liga de pago",
  DEPOSITO_ANTICIPO: "Depósito/Anticipo",
  EFECTIVO: "Efectivo",
}

export default function PagosClient({ pagos, total, pagina, porPagina, resumen, usuario }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPaginas = Math.ceil(total / porPagina)

  const cobradoTotal = resumen.find(r => r.estatus === "PAGADO")?._sum?.monto ?? 0
  const pendienteTotal = resumen.find(r => r.estatus === "PENDIENTE")?._sum?.monto ?? 0
  const vencidoTotal = resumen.find(r => r.estatus === "VENCIDO")?._sum?.monto ?? 0
  const vencidoCount = resumen.find(r => r.estatus === "VENCIDO")?._count ?? 0

  function filtrarEstatus(estatus: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (estatus) params.set("estatus", estatus)
    else params.delete("estatus")
    params.set("pagina", "1")
    router.push(`/pagos?${params.toString()}`)
  }

  const estatusActivo = searchParams.get("estatus")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pagos</h1>
          </div>
          <p className="text-sm text-gray-500">Lo que cobraste y lo que falta</p>
        </div>
        <Link href="/pagos/nuevo">
          <Button variant="primary">+ Registrar pago</Button>
        </Link>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="md">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Cobrado
          </p>
          <p className="text-2xl font-bold text-green-600">{formatMonto(cobradoTotal)}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" /> Pendiente
          </p>
          <p className="text-2xl font-bold text-amber-600">{formatMonto(pendienteTotal)}</p>
        </Card>
        <Card padding="md" className={cn(vencidoTotal > 0 && "border-red-200 dark:border-red-800")}>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
            <AlertCircle className={cn("h-3.5 w-3.5", vencidoTotal > 0 ? "text-red-500" : "text-gray-400")} /> Vencido
          </p>
          <p className={cn("text-2xl font-bold", vencidoTotal > 0 ? "text-red-600" : "text-gray-900 dark:text-white")}>
            {formatMonto(vencidoTotal)}
          </p>
          {vencidoCount > 0 && (
            <p className="text-xs text-red-500">{vencidoCount} pago{vencidoCount !== 1 ? "s" : ""}</p>
          )}
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[null, "PAGADO", "PENDIENTE", "VENCIDO"].map((e) => (
          <button
            key={e ?? "todos"}
            onClick={() => filtrarEstatus(e)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              estatusActivo === e || (!estatusActivo && !e)
                ? "bg-[#a78bdb] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"
            )}
          >
            {e === null ? "Todos" : e === "PAGADO" ? "Cobrados" : e === "PENDIENTE" ? "Pendientes" : "Vencidos"}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {pagos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Sin pagos registrados</div>
        ) : (
          <table className="w-full hidden md:table">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 uppercase">
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Concepto</th>
                <th className="text-right px-4 py-3">Monto</th>
                <th className="text-left px-4 py-3">Método</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {pagos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/clientes/${p.cliente.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#a78bdb] hover:underline">
                      {p.cliente.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.concepto ?? "—"}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-white">
                    {formatMonto(p.monto)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{metodosLabel[p.metodo] ?? p.metodo}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {p.estatus === "PAGADO" && p.fechaPago
                      ? formatFechaCompleta(p.fechaPago)
                      : p.fechaVencimiento
                      ? `Vence: ${formatFechaCompleta(p.fechaVencimiento)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.estatus === "PAGADO" ? "success" : p.estatus === "VENCIDO" ? "danger" : "warning"}>
                      {p.estatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Móvil */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {pagos.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex justify-between mb-1">
                <Link href={`/clientes/${p.cliente.id}`} className="font-medium text-gray-900 dark:text-white hover:underline">
                  {p.cliente.nombre}
                </Link>
                <p className="font-bold text-gray-900 dark:text-white">{formatMonto(p.monto)}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={p.estatus === "PAGADO" ? "success" : p.estatus === "VENCIDO" ? "danger" : "warning"}>
                  {p.estatus}
                </Badge>
                <span className="text-xs text-gray-500">{metodosLabel[p.metodo]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Mostrando {((pagina-1)*porPagina)+1}–{Math.min(pagina*porPagina, total)} de {total}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={pagina <= 1} onClick={() => router.push(`/pagos?pagina=${pagina-1}`)}>
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button variant="secondary" size="sm" disabled={pagina >= totalPaginas} onClick={() => router.push(`/pagos?pagina=${pagina+1}`)}>
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
