"use client"
import { useState } from "react"
import { Crown, Star, Phone, Calendar, CheckCircle, ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

interface Props {
  config: any
  utm: { utm_source?: string; utm_medium?: string; utm_campaign?: string }
}

export default function LandingClient({ config, utm }: Props) {
  const { success, error: showError } = useToast()
  const [form, setForm] = useState({ nombre: "", telefono: "", correo: "" })
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const waNumero = config?.whatsappNegocio ?? "5213312345678"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.telefono) {
      showError("Por favor llena tu nombre y WhatsApp")
      return
    }
    setLoading(true)

    try {
      const response = await fetch("/api/landing/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          origen: "Landing",
          canalUtm: utm.utm_source ?? "landing",
        }),
      })

      if (response.ok) {
        setEnviado(true)
        success("¡Listo! Te contactamos en menos de 24 horas 😊")
      } else {
        showError("Ocurrió un error. Intenta de nuevo o escríbenos por WhatsApp.")
        // Guardar intento para no perderlo
        await fetch("/api/landing/intento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datos: form }),
        }).catch(() => {})
      }
    } catch {
      showError("Sin conexión. Guarda tu número y escríbenos por WhatsApp.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3eeff] via-white to-[#fde8f4] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-[#a78bdb]" />
            <span className="font-bold text-gray-900 dark:text-white">Princessitas Ceremonias</span>
          </div>
          <a href={`https://wa.me/${waNumero}?text=${encodeURIComponent("Hola, me gustaría más información sobre sus vestidos")}`} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="sm" icon={<MessageCircle className="h-4 w-4" />}>
              WhatsApp
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#a78bdb]/10 px-4 py-1.5 text-sm text-[#7050ad] mb-6 border border-[#a78bdb]/20">
          <Crown className="h-4 w-4" />
          Guadalajara, México
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          Vestidos de Primera Comunión y{" "}
          <span className="text-[#a78bdb]">Ropones de Bautizo</span>{" "}
          que harán brillar a tu niña
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Vestidos de fiesta, primera comunión y ropones de bautizo para niña y niño.
          Trajes de niño y accesorios para ceremonias especiales.
        </p>

        {/* Formulario de captura */}
        {!enviado ? (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Agenda tu cita gratis 📅
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Llena tu datos y te contactamos en menos de 24 horas
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
              <Input
                placeholder="Tu WhatsApp (ej. 33 1234 5678)"
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                required
              />
              <Input
                placeholder="Tu correo (opcional)"
                type="email"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
                iconRight={<ArrowRight className="h-4 w-4" />}
              >
                Quiero agendar mi cita
              </Button>
            </form>
            <p className="text-xs text-gray-400 mt-3 text-center">
              ¿No quieres esperar? <a href={`https://wa.me/${waNumero}`} target="_blank" rel="noopener noreferrer" className="text-[#a78bdb] underline">Escríbenos ya por WhatsApp</a>
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-green-100 shadow-xl p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Listo, {form.nombre}! 🎉
            </h2>
            <p className="text-gray-500 mb-4">
              Te contactamos en menos de 24 horas por WhatsApp.
            </p>
            <a href={`https://wa.me/${waNumero}?text=${encodeURIComponent(`Hola, soy ${form.nombre} y acabo de dejar mis datos en su página. ¿Cuándo podemos agendar?`)}`} target="_blank" rel="noopener noreferrer">
              <Button variant="success" icon={<MessageCircle className="h-4 w-4" />}>
                Escríbenos ya por WhatsApp
              </Button>
            </a>
          </div>
        )}
      </section>

      {/* Productos */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Todo para ceremonias especiales
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: "👑", title: "Primera Comunión", desc: "Vestidos blancos e ivory" },
            { emoji: "🌸", title: "Fiesta para Niña", desc: "Vestidos de fiesta" },
            { emoji: "🕊️", title: "Bautizo Niña", desc: "Ropones elegantes" },
            { emoji: "✨", title: "Bautizo Niño", desc: "Ropones y trajes" },
          ].map((p) => (
            <div key={p.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center hover:border-[#a78bdb]/40 hover:shadow-md transition-all">
              <p className="text-3xl mb-2">{p.emoji}</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Lo que dicen nuestras mamás 💜
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { nombre: "Karla M.", texto: "El vestido de mi hija quedó precioso. El servicio fue increíble y muy puntual.", estrellas: 5 },
            { nombre: "Sandra R.", texto: "Encontré exactamente lo que buscaba. Mucha variedad y buen precio.", estrellas: 5 },
            { nombre: "Lupita V.", texto: "Llevé a mis tres sobrinas y todas quedaron encantadas. ¡100% recomendadas!", estrellas: 5 },
          ].map((t) => (
            <div key={t.nombre} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.estrellas }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">"{t.texto}"</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t.nombre}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-400 text-sm mt-4">+500 familias atendidas en Guadalajara</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center text-sm text-gray-400">
        <p>Princessitas Ceremonias · Guadalajara, México</p>
        <p className="mt-1">
          <a href={`https://wa.me/${waNumero}`} target="_blank" rel="noopener noreferrer" className="text-[#a78bdb] hover:underline">
            WhatsApp
          </a>
        </p>
      </footer>
    </div>
  )
}
