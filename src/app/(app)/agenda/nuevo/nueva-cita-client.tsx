"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarDays } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { agendarCita } from "@/app/actions/citas"

export default function NuevaCitaClient({
  clientes,
  clienteIdInicial,
}: {
  clientes: { id: string; nombre: string }[]
  clienteIdInicial: string
}) {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({
    clienteId: clienteIdInicial,
    titulo: "",
    fecha: today,
    hora: "10:00",
    duracion: "30",
    googleMeetLink: "",
    notas: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clienteId) { showError("Selecciona un cliente"); return }
    setLoading(true)
    const result = await agendarCita({ ...form, duracion: parseInt(form.duracion) })
    setLoading(false)
    if (result.error) { showError(result.error); return }
    success("¡Cita agendada! ✓")
    router.push(form.clienteId ? `/clientes/${form.clienteId}` : "/agenda")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/agenda">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver a agenda
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agendar cita</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card padding="lg">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Datos de la cita</h2>
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
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <Input
              label="Título (opcional)"
              placeholder="Prueba de vestido / Llamada de seguimiento"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha *"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
              />
              <Input
                label="Hora *"
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Duración (minutos)
                </label>
                <select
                  value={form.duracion}
                  onChange={(e) => setForm({ ...form, duracion: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a78bdb]"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hora</option>
                  <option value="90">1.5 horas</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
              <Input
                label="Link de Meet (opcional)"
                placeholder="https://meet.google.com/..."
                value={form.googleMeetLink}
                onChange={(e) => setForm({ ...form, googleMeetLink: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <Textarea
            label="Notas"
            placeholder="Lo que debes preparar, lo que acordaron, etc."
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            rows={3}
          />
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/agenda">
            <Button variant="secondary">Cancelar</Button>
          </Link>
          <Button type="submit" variant="primary" loading={loading}>
            Guardar cita
          </Button>
        </div>
      </form>
    </div>
  )
}
