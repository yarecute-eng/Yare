"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wallet } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { registrarPago } from "@/app/actions/pagos"

interface Cliente {
  id: string
  nombre: string
  vendedor: { nombre: string }
}

export default function NuevoPagoClient({
  clientes,
  clienteIdInicial,
  esAdmin,
}: {
  clientes: Cliente[]
  clienteIdInicial: string
  esAdmin: boolean
}) {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clienteId: clienteIdInicial,
    monto: "",
    montoTotal: "",
    metodo: "TRANSFERENCIA" as const,
    estatus: "PAGADO" as const,
    concepto: "",
    fechaPago: new Date().toISOString().split("T")[0],
    fechaVencimiento: "",
    notas: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clienteId) {
      showError("Selecciona un cliente")
      return
    }
    setLoading(true)
    const result = await registrarPago({
      clienteId: form.clienteId,
      monto: parseFloat(form.monto),
      montoTotal: form.montoTotal ? parseFloat(form.montoTotal) : undefined,
      metodo: form.metodo,
      estatus: form.estatus,
      concepto: form.concepto || undefined,
      fechaPago: form.estatus === "PAGADO" ? form.fechaPago || undefined : undefined,
      fechaVencimiento: form.estatus !== "PAGADO" ? form.fechaVencimiento || undefined : undefined,
      notas: form.notas || undefined,
    })
    setLoading(false)

    if (result.error) {
      showError(result.error)
      return
    }
    success("¡Pago registrado! ✓")
    router.push(form.clienteId ? `/clientes/${form.clienteId}` : "/pagos")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pagos">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver a pagos
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-emerald-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrar pago</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card padding="lg">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Datos del pago</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Cliente *
              </label>
              <select
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a78bdb]"
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}{esAdmin ? ` — ${c.vendedor.nombre}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Monto pagado ($) *"
                type="number"
                placeholder="1500"
                min="0.01"
                step="0.01"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                required
              />
              <Input
                label="Total del evento ($)"
                type="number"
                placeholder="5000"
                min="0"
                step="0.01"
                value={form.montoTotal}
                onChange={(e) => setForm({ ...form, montoTotal: e.target.value })}
                hint="Precio total acordado (opcional)"
              />
            </div>

            <Input
              label="Concepto"
              placeholder="Anticipo / Saldo / Apartado"
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Método de pago *"
                value={form.metodo}
                onChange={(e) => setForm({ ...form, metodo: e.target.value as any })}
              >
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="LIGA_DE_PAGO">Liga de pago</option>
                <option value="DEPOSITO_ANTICIPO">Depósito / Anticipo</option>
                <option value="EFECTIVO">Efectivo</option>
              </Select>

              <Select
                label="Estatus *"
                value={form.estatus}
                onChange={(e) => setForm({ ...form, estatus: e.target.value as any })}
              >
                <option value="PAGADO">Pagado ✓</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="VENCIDO">Vencido</option>
              </Select>
            </div>

            {form.estatus === "PAGADO" ? (
              <Input
                label="Fecha de pago"
                type="date"
                value={form.fechaPago}
                onChange={(e) => setForm({ ...form, fechaPago: e.target.value })}
              />
            ) : (
              <Input
                label="Fecha de vencimiento"
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
              />
            )}
          </div>
        </Card>

        <Card padding="lg">
          <Textarea
            label="Notas internas"
            placeholder="Número de referencia, comprobante, etc."
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            rows={3}
          />
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/pagos">
            <Button variant="secondary">Cancelar</Button>
          </Link>
          <Button type="submit" variant="primary" loading={loading}>
            Guardar pago
          </Button>
        </div>
      </form>
    </div>
  )
}
