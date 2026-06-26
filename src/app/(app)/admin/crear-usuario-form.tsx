"use client"
import { useState } from "react"
import { UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { crearUsuario } from "@/app/actions/usuario"
import { useRouter } from "next/navigation"

export default function CrearUsuarioForm() {
  const [abierto, setAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const { success, error: showError } = useToast()
  const router = useRouter()

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "VENDEDOR" as "ADMIN" | "VENDEDOR",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await crearUsuario(form)
    setLoading(false)
    if (result.error) { showError(result.error); return }
    success("Usuario creado ✓")
    setForm({ nombre: "", correo: "", contrasena: "", rol: "VENDEDOR" })
    setAbierto(false)
    router.refresh()
  }

  if (!abierto) {
    return (
      <Button
        variant="primary"
        size="sm"
        icon={<UserPlus className="h-4 w-4" />}
        onClick={() => setAbierto(true)}
      >
        Agregar usuario
      </Button>
    )
  }

  return (
    <Card padding="lg" className="border-[#a78bdb]/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-[#a78bdb]" /> Nuevo usuario
        </h3>
        <button onClick={() => setAbierto(false)}>
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            placeholder="Ana García"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <Input
            label="Correo"
            type="email"
            placeholder="ana@ejemplo.com"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Contraseña inicial"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={form.contrasena}
            onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
            required
          />
          <Select
            label="Rol"
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value as any })}
          >
            <option value="VENDEDOR">Vendedor</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="secondary" size="sm" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Crear usuario
          </Button>
        </div>
      </form>
    </Card>
  )
}
