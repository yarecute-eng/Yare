"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Search, Bell, Sun, Moon, Monitor, HelpCircle, Plus, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"

interface TopbarProps {
  usuario: { nombre: string; rol: string; id: string }
  pageTitle?: string
  recordatoriosVencidos?: number
}

export function Topbar({ usuario, pageTitle, recordatoriosVencidos = 0 }: TopbarProps) {
  const { tema, setTema } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const router = useRouter()

  return (
    <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
      {/* Título de página */}
      {pageTitle && (
        <h1 className="text-base font-semibold text-gray-900 dark:text-white hidden md:block">
          {pageTitle}
        </h1>
      )}

      {/* Búsqueda rápida */}
      <button
        onClick={() => router.push("/buscar")}
        className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-400 hover:border-[#a78bdb] transition-colors flex-1 max-w-xs"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden sm:block">Buscar... (Ctrl+K)</span>
        <span className="sm:hidden">Buscar...</span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        {/* Botón + Nuevo */}
        <Link href="/clientes/nuevo">
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
            <span className="hidden sm:block">Nuevo</span>
          </Button>
        </Link>

        {/* Campanita */}
        <div className="relative">
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={`${recordatoriosVencidos} recordatorios pendientes`}
          >
            <Bell className="h-5 w-5" />
            {recordatoriosVencidos > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Selector de tema */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cambiar tema"
          >
            {tema === "claro" ? <Sun className="h-5 w-5" /> : tema === "oscuro" ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </button>
          {showThemeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border bg-white dark:bg-gray-900 shadow-lg p-1">
                {([
                  { value: "claro", icon: Sun, label: "Claro ☀️" },
                  { value: "oscuro", icon: Moon, label: "Oscuro 🌙" },
                  { value: "auto", icon: Monitor, label: "Del sistema 🖥️" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setTema(opt.value); setShowThemeMenu(false) }}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left",
                      tema === opt.value
                        ? "bg-[#a78bdb]/10 text-[#a78bdb]"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Ayuda */}
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Ayuda">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Avatar / menú de usuario */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar nombre={usuario.nombre} size="sm" />
          </button>
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border bg-white dark:bg-gray-900 shadow-lg p-1">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium truncate">{usuario.nombre}</p>
                  <p className="text-xs text-gray-500">{usuario.rol}</p>
                </div>
                <Link href="/perfil" onClick={() => setShowUserMenu(false)}>
                  <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <User className="h-4 w-4" /> Mi perfil
                  </button>
                </Link>
                {usuario.rol === "ADMIN" && (
                  <Link href="/admin" onClick={() => setShowUserMenu(false)}>
                    <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Settings className="h-4 w-4" /> Configuración
                    </button>
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
