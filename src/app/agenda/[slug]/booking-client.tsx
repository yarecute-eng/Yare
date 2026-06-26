"use client"
import { useState } from "react"
import { CalendarDays, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { agendarCitaPublica } from "@/app/actions/citas"

interface Vendedor {
  id: string
  nombre: string
  avatar: string | null
  slugAgenda: string | null
}

export default function BookingClient({ vendedor }: { vendedor: Vendedor }) {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState("")

  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    fecha: today,
    hora: "10:00",
    notas: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await agendarCitaPublica({
      slugAgenda: vendedor.slugAgenda!,
      ...form,
    })
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f0ff] to-white p-4">
        <Card padding="lg" className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">¡Listo!</h1>
          <p className="text-gray-500">
            Tu cita con <strong>{vendedor.nombre}</strong> fue agendada. Pronto te contactaremos para confirmar.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0ff] to-white p-4 flex items-start justify-center pt-10">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <div className="h-16 w-16 rounded-full bg-[#a78bdb] flex items-center justify-center text-white text-2xl font-bold">
              {vendedor.nombre.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-[#a78bdb]" />
            <h1 className="text-xl font-bold text-gray-900">Princessitas Ceremonias</h1>
          </div>
          <p className="text-gray-500 text-sm">Agenda una cita con <strong>{vendedor.nombre}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card padding="lg">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#a78bdb]" /> Tus datos
            </h2>
            <div className="space-y-3">
              <Input
                label="Nombre completo *"
                placeholder="María García"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
              <Input
                label="WhatsApp / Teléfono *"
                placeholder="33 1234 5678"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                required
              />
              <Input
                label="Correo (opcional)"
                type="email"
                placeholder="maria@gmail.com"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="font-semibold text-gray-900 mb-4">¿Cuándo quieres tu cita?</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Fecha *"
                  type="date"
                  value={form.fecha}
                  min={today}
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
              <Textarea
                label="¿Qué necesitas? (opcional)"
                placeholder="Ej. Vestido de XV años, talla 10, quincena en octubre..."
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                rows={3}
              />
            </div>
          </Card>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Solicitar cita
          </Button>

          <p className="text-center text-xs text-gray-400">
            Tu información es confidencial y solo se usará para contactarte.
          </p>
        </form>
      </div>
    </div>
  )
}
