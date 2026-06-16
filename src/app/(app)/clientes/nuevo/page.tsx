"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { crearCliente } from "@/app/actions/clientes"
import { InfoTooltip } from "@/components/ui/tooltip"

export default function NuevoClientePage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    origen: "",
    etapa: "NUEVO",
    temperatura: "TIBIO",
    valorEstimado: "",
    objecionPrincipal: "",
    notas: "",
    proximaAccion: "",
    proximaAccionFecha: "",
    productoInteres: "",
    tallas: "",
    empresa: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await crearCliente({
      ...form,
      valorEstimado: form.valorEstimado ? parseFloat(form.valorEstimado) : undefined,
    })
    setLoading(false)

    if (result.error && result.clienteExistenteId) {
      showError(result.error)
      return
    }
    if (result.error) {
      showError(result.error)
      return
    }
    success("¡Cliente guardado! ✓")
    router.push(`/clientes/${result.clienteId}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/clientes">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver a clientes
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agregar cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Datos principales */}
        <Card padding="lg">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Datos principales</h2>
          <div className="space-y-4">
            <Input
              label="Nombre completo *"
              placeholder="María García"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Teléfono / WhatsApp"
                placeholder="33 1234 5678"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                hint="Pon el número con lada, ej. 33 1234 5678"
              />
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="cliente@gmail.com"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Origen / Canal"
                value={form.origen}
                onChange={(e) => setForm({ ...form, origen: e.target.value })}
              >
                <option value="">Selecciona origen</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="WhatsApp">WhatsApp directo</option>
                <option value="Recomendado">Recomendado</option>
                <option value="Landing">Landing (página web)</option>
                <option value="Mostrador">Mostrador / presencial</option>
                <option value="Otro">Otro</option>
              </Select>
              <Select
                label="Etapa del embudo"
                value={form.etapa}
                onChange={(e) => setForm({ ...form, etapa: e.target.value })}
              >
                <option value="NUEVO">Nuevo</option>
                <option value="CONTACTADO">Contactado</option>
                <option value="PROPUESTA_ENVIADA">Propuesta enviada</option>
                <option value="CLIENTE_NUEVO">Cliente Nuevo</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Información comercial */}
        <Card padding="lg">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Información de venta
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperatura</label>
                  <InfoTooltip
                    texto="Qué tan cerca está de comprar."
                    consejo="🔥 Caliente = atiéndelo hoy. 🔵 Frío = a futuro. Gasta tu energía primero en los calientes."
                  />
                </div>
                <Select
                  value={form.temperatura}
                  onChange={(e) => setForm({ ...form, temperatura: e.target.value })}
                >
                  <option value="CALIENTE">🔥 Caliente</option>
                  <option value="TIBIO">🟡 Tibio</option>
                  <option value="FRIO">🔵 Frío</option>
                </Select>
              </div>
              <Input
                label="Valor estimado ($)"
                type="number"
                placeholder="5000"
                value={form.valorEstimado}
                onChange={(e) => setForm({ ...form, valorEstimado: e.target.value })}
                hint="Cuánto dinero representa si cierra"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Objeción principal
                </label>
                <InfoTooltip
                  texto="La razón por la que NO te ha comprado."
                  consejo="Anótala apenas la oigas. Es lo que vas a vencer para cerrar."
                />
              </div>
              <Select
                value={form.objecionPrincipal}
                onChange={(e) => setForm({ ...form, objecionPrincipal: e.target.value })}
              >
                <option value="">Sin objeción registrada</option>
                <option value="Lo voy a pensar">Lo voy a pensar</option>
                <option value="Tengo que consultarlo con mi pareja/socio">Tengo que consultarlo con mi pareja/socio</option>
                <option value="Ya tengo otro proveedor">Ya tengo otro proveedor</option>
                <option value="Está muy caro">Está muy caro</option>
                <option value="No me convence del todo">No me convence del todo</option>
                <option value="No es el momento">No es el momento</option>
                <option value="Otra">Otra</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Producto de interés"
                placeholder="Vestido primera comunión"
                value={form.productoInteres}
                onChange={(e) => setForm({ ...form, productoInteres: e.target.value })}
              />
              <Input
                label="Tallas / preferencias"
                placeholder="Talla 10, color blanco"
                value={form.tallas}
                onChange={(e) => setForm({ ...form, tallas: e.target.value })}
              />
            </div>

            <Input
              label="Empresa (opcional)"
              placeholder="Boutique / Nombre del negocio"
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
            />
          </div>
        </Card>

        {/* Próxima acción */}
        <Card padding="lg">
          <div className="flex items-center gap-1.5 mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Próxima acción</h2>
            <InfoTooltip
              texto="El siguiente paso con este cliente y cuándo."
              consejo="Si lo dejas vacío, el cliente se te enfría. Siempre déjale una."
            />
          </div>
          <div className="space-y-4">
            <Input
              label="¿Qué sigue con este cliente?"
              placeholder="Llamar para dar seguimiento a propuesta"
              value={form.proximaAccion}
              onChange={(e) => setForm({ ...form, proximaAccion: e.target.value })}
            />
            <Input
              label="¿Para cuándo?"
              type="date"
              value={form.proximaAccionFecha}
              onChange={(e) => setForm({ ...form, proximaAccionFecha: e.target.value })}
            />
          </div>
        </Card>

        {/* Notas */}
        <Card padding="lg">
          <Textarea
            label="Notas"
            placeholder="Lo que quieras recordar de este cliente..."
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            rows={3}
          />
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/clientes">
            <Button variant="secondary">Cancelar</Button>
          </Link>
          <Button type="submit" variant="primary" loading={loading}>
            Guardar cliente
          </Button>
        </div>
      </form>
    </div>
  )
}
