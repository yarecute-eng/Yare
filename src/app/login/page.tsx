"use client"
import { useState, useActionState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Crown, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      correo,
      contrasena,
      redirect: false,
    })

    setLoading(false)
    if (result?.error) {
      setError("Correo o contraseña incorrectos. Revisa tus datos e intenta de nuevo.")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3eeff] to-white dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-[#a78bdb] flex items-center justify-center shadow-lg shadow-[#a78bdb]/30">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Princessitas Ceremonias
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Sistema de gestión de clientes
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Iniciar sesión
          </h2>

          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="hola@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-[#a78bdb] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Entrar al CRM
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          ¿Problemas para entrar? Contacta al administrador del sistema.
        </p>
      </div>
    </div>
  )
}
