"use client"
import { useState } from "react"
import { User, Link as LinkIcon, Lock, Target, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { actualizarPerfil, cambiarContrasena } from "@/app/actions/usuario"

interface User {
  id: string
  nombre: string
  correo: string
  rol: string
  slugAgenda: string | null
  metaMensual: number | null
  creadoEn: Date
}

export default function PerfilClient({ user, baseUrl }: { user: User; baseUrl: string }) {
  const { success, error: showError } = useToast()
  const [loadingPerfil, setLoadingPerfil] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)
  const [copied, setCopied] = useState(false)

  const [perfil, setPerfil] = useState({
    nombre: user.nombre,
    slugAgenda: user.slugAgenda ?? "",
    metaMensual: user.metaMensual?.toString() ?? "",
  })

  const [pass, setPass] = useState({ actual: "", nueva: "", confirmar: "" })

  const bookingUrl = perfil.slugAgenda
    ? `${baseUrl}/agenda/${perfil.slugAgenda}`
    : null

  async function handlePerfil(e: React.FormEvent) {
    e.preventDefault()
    setLoadingPerfil(true)
    const result = await actualizarPerfil({
      nombre: perfil.nombre,
      slugAgenda: perfil.slugAgenda || undefined,
      metaMensual: perfil.metaMensual ? parseFloat(perfil.metaMensual) : undefined,
    })
    setLoadingPerfil(false)
    if (result.error) { showError(result.error); return }
    success("Perfil actualizado ✓")
  }

  async function handlePass(e: React.FormEvent) {
    e.preventDefault()
    if (pass.nueva !== pass.confirmar) { showError("Las contraseñas no coinciden"); return }
    setLoadingPass(true)
    const result = await cambiarContrasena({ actual: pass.actual, nueva: pass.nueva })
    setLoadingPass(false)
    if (result.error) { showError(result.error); return }
    success("Contraseña actualizada ✓")
    setPass({ actual: "", nueva: "", confirmar: "" })
  }

  function copiarUrl() {
    if (!bookingUrl) return
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-[#a78bdb]" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi perfil</h1>
      </div>

      {/* Info básica */}
      <Card padding="lg">
        <p className="text-sm text-gray-500 mb-1">Correo</p>
        <p className="font-medium text-gray-900 dark:text-white">{user.correo}</p>
        <p className="text-xs text-gray-400 mt-1 capitalize">{user.rol.toLowerCase()}</p>
      </Card>

      {/* Editar perfil */}
      <form onSubmit={handlePerfil}>
        <Card padding="lg" className="space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" /> Datos personales
          </h2>

          <Input
            label="Nombre"
            value={perfil.nombre}
            onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
            required
          />

          <Input
            label="Meta mensual ($)"
            type="number"
            placeholder="20000"
            value={perfil.metaMensual}
            onChange={(e) => setPerfil({ ...perfil, metaMensual: e.target.value })}
            hint="Cuánto quieres vender al mes"
          />

          <div>
            <Input
              label="Slug de tu liga de citas"
              placeholder="ana-garcia"
              value={perfil.slugAgenda}
              onChange={(e) =>
                setPerfil({ ...perfil, slugAgenda: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })
              }
              hint="Solo letras minúsculas, números y guiones. Ej: ana-garcia"
            />
            {bookingUrl && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#a78bdb]/10 px-3 py-2">
                <LinkIcon className="h-3.5 w-3.5 text-[#a78bdb] shrink-0" />
                <span className="text-xs text-[#a78bdb] truncate flex-1">{bookingUrl}</span>
                <button type="button" onClick={copiarUrl} className="shrink-0">
                  {copied
                    ? <CheckCircle className="h-4 w-4 text-green-500" />
                    : <Copy className="h-4 w-4 text-[#a78bdb]" />}
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={loadingPerfil}>
              Guardar cambios
            </Button>
          </div>
        </Card>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handlePass}>
        <Card padding="lg" className="space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-400" /> Cambiar contraseña
          </h2>

          <Input
            label="Contraseña actual"
            type="password"
            value={pass.actual}
            onChange={(e) => setPass({ ...pass, actual: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nueva contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={pass.nueva}
              onChange={(e) => setPass({ ...pass, nueva: e.target.value })}
              required
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              value={pass.confirmar}
              onChange={(e) => setPass({ ...pass, confirmar: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={loadingPass}>
              Cambiar contraseña
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
